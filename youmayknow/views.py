import redis, requests
from suds.client import Client

from django.shortcuts import render_to_response
from django.template import Context, loader, RequestContext
from django.http import HttpResponse, HttpResponseRedirect
from django.core.urlresolvers import reverse
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth.decorators import login_required
from django.conf import settings

from youmayknow.models import News, HomeTown

r = redis.StrictRedis(host='localhost', port=6379, db=1)

API_KEY = settings.API_KEY
client = Client(settings.API_WSDL)

def send_sms(txt, num):
    requests.get(settings.SMS_ENDPOINT % (num, txt))

def homescreenlogin(request):
    username = request.POST['username']
    password = request.POST['password']
    user = authenticate(username=username, password=password)
    if user is not None:
        if user.is_active:
            login(request, user)
            return HttpResponseRedirect(reverse(homescreen))
        else:
            return HttpResponseRedirect(reverse(index))
    else:
        return HttpResponseRedirect(reverse(index))

def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse(index))

def findMatches(result):
    new_search = client.factory.create('searchQuery')
    potential_search_fields = [('tribe', 'tribe'), ('lastName', 'names'),
                 ('homeTown', 'homeTown'), ('familySize', 'familySize'),
                 ('countryOfBirth', 'countryOfBirth')]
    searched_fields = []
    for profile_field_name, search_field_name in potential_search_fields:
        if hasattr(result, profile_field_name):
            field_value = result[profile_field_name]
            if field_value:
                setattr(new_search, search_field_name, field_value)
                searched_fields.append(profile_field_name)

    if len(searched_fields) >= 3:
        num_results = client.service.AdvancedSearchResultCount(new_search, API_KEY)
        if num_results <= 20 and num_results > 1:
            search_results = client.service.AdvancedSearch(new_search, API_KEY)
            return search_results, searched_fields

    return [], []

@login_required
def youmayknow(request):
    """Based on information about the logged-in user, query the refugees
    united API for likely matches.
    """
    guid = request.user.get_profile().guid or ''
    profile = client.service.GetProfile(guid, API_KEY)
    results, fields = findMatches(profile)
    for result in results:
        result['seen'] = not r.sadd("guids_seen:%s" % guid, result.guid)
        result['matchingFields'] = []
        for field in fields:
            if profile[field] == result[field]:
                result['matchingFields'].append(field)

    return render_to_response('wap/youmayknow.html',
              {'results': results}, context_instance=RequestContext(request))

def index(request):
    if request.user.is_authenticated():
        return HttpResponseRedirect(reverse(homescreen))
    return render_to_response('wap/index.html', {},
                  context_instance=RequestContext(request))

def createuserform(request):
    return render_to_response('wap/createuserform.html', {},
                  context_instance=RequestContext(request))

def createuser(request):
    form = UserCreationForm(request.POST)
    if form.is_valid():
        user = form.save()
        profile = user.get_profile()

        # HACK - bad idea to take unvalidated data from POST
        profile.home_town = request.POST['home_town']
        profile.country_of_birth = request.POST['country_of_birth']

        # We are mocking up the actual WAP application, and pretending
        # that this is a real registration on Refugees United
        profile.guid = '402881ae27b92f770127b98895211d42'
        profile.save()

        # hack - log the new user in immediately
        user.backend='django.contrib.auth.backends.ModelBackend'
        login(request, user)
        return HttpResponseRedirect(reverse(homescreen))
    else:
        return render_to_response('wap/createuserform.html',
              {'errors': form.errors}, context_instance=RequestContext(request))

@login_required
def homescreen(request):
    return render_to_response('wap/homescreen.html', {},
              context_instance=RequestContext(request))

def news(request):
    if request.user.is_authenticated():
        home_town_name = request.user.get_profile().home_town
    else:
        home_town_name = request.GET.get('home_town', '')
    try:
        home_town = HomeTown.objects.get(name__iexact=home_town_name)
        news = News.objects.filter(home_town=home_town)
        data = {'home_town': home_town, 'news': news}
    except HomeTown.DoesNotExist:
        data = {}
    return render_to_response('wap/news.html', data, context_instance=RequestContext(request))

def user(request, user=''):
    try:
        user = User.objects.get(username=user)
        data = {'user': user}
    except User.DoesNotExist:
        data = {}
    return render_to_response('wap/user.html', data, context_instance=RequestContext(request))

@login_required
def add_news(request):
    try:
        home_town = HomeTown.objects.get(name=request.POST.get('home_town', ''))
    except HomeTown.DoesNotExist:
        return HttpResponse('error')
    News.objects.create(author=request.user,
                        text=request.POST['text'],
                        home_town=home_town)
    profiles = UserProfile.objects.filter(home_town__iexact=home_town.name)
    for profile in profiles:
        send_sms(request.POST['text'], profile.mobile_number)
    return HttpResponseRedirect(reverse(homescreen))
