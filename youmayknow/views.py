from suds.client import Client

from django.shortcuts import render_to_response
from django.template import Context, loader, RequestContext
from django.http import HttpResponse, HttpResponseRedirect
from django.core.urlresolvers import reverse
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth.decorators import login_required
import requests

from youmayknow.models import News, HomeTown

import redis

r = redis.StrictRedis(host='localhost', port=6379, db=1)

url = 'http://78.109.215.13:8080/RefugeesUnited-RefugeesUnitedBusiness/OpenAPIBean?wsdl'
client = Client(url)
apiKey = '27341080-b050-11df-94e2-0800200c9a66'
sms = 'http://api.clickatell.com/http/sendmsg?user=refunite&password=Phai1lee&api_id=3299042&to=%s&text=%s'

def send_sms(txt, num):
    requests.get(sms % (num, txt))


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
    newSearch = client.factory.create('searchQuery')

    def applyField(getFieldName, setFieldName):
        if hasattr(result, getFieldName) and getattr(result, getFieldName) != None and getattr(result, getFieldName) != 0:
            setattr(newSearch, setFieldName, getattr(result, getFieldName))
            return True

        return False

    fieldsSearchedOn = []

    if applyField("tribe", "tribe"): fieldsSearchedOn.append("tribe")
    if applyField("lastName", "names"): fieldsSearchedOn.append("lastName")
    if applyField("homeTown", "homeTown"): fieldsSearchedOn.append("homeTown")
    if applyField("familySize", "familySize"): fieldsSearchedOn.append("familySize")
    if applyField("countryOfBirth", "countryOfBirth"): fieldsSearchedOn.append("countryOfBirth")

    if len(fieldsSearchedOn) >= 3:
        resultSetSize = client.service.AdvancedSearchResultCount(newSearch, "27341080-b050-11df-94e2-0800200c9a66")
        print resultSetSize
        if resultSetSize <= 10 and resultSetSize > 1:
            return client.service.AdvancedSearch(newSearch, "27341080-b050-11df-94e2-0800200c9a66"), fieldsSearchedOn

    return [], []

@login_required
def youmayknow(request):
    guid = request.user.get_profile().guid or ''
    profile = client.service.GetProfile(guid, apiKey)
    results, fields = findMatches(profile)
    newCount = 0
    for result in results:
        result['seen'] = result.guid in r.smembers("guids_seen:" + guid)
        if not result['seen']:
            r.sadd("guids_seen:" + guid, result.guid)
            newCount += 1
        result['matchingFields'] = []
        for field in fields:
            if profile[field] == result[field]:
                result['matchingFields'].append(field)

    return render_to_response('wap/youmayknow.html', {'results': results}, context_instance=RequestContext(request))

def index(request):
    if request.user.is_authenticated():
        return HttpResponseRedirect(reverse(homescreen))
    return render_to_response('wap/index.html', {}, context_instance=RequestContext(request))

def createuserform(request):
    return render_to_response('wap/createuserform.html', {}, context_instance=RequestContext(request))

def createuser(request):
    form = UserCreationForm(request.POST)
    if form.is_valid():
        user = form.save()
        # all kinds of bad going on here. This is a hack day project so suck it.
        profile = user.get_profile()
        profile.home_town = request.POST['home_town']
        profile.country_of_birth = request.POST['country_of_birth']
        profile.guid = '402881ae27b92f770127b98895211d42'
        profile.save()
        user.backend='django.contrib.auth.backends.ModelBackend'
        login(request, user)
        return HttpResponseRedirect(reverse(homescreen))
    else:
        return render_to_response('wap/createuserform.html',
              {'errors': form.errors}, context_instance=RequestContext(request))

@login_required
def homescreen(request):
    return render_to_response('wap/homescreen.html', {}, context_instance=RequestContext(request))

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

def add_news(request):
    try:
        home_town = HomeTown.objects.get(name=request.POST.get('home_town', ''))
    except HomeTown.DoesNotExist:
        return HttpResponse('error')
    News.objects.create(author=request.user,
                        text=request.POST['text'],
                        home_town=home_town)
    send_sms(request.POST['text'], '447943809605')
    return HttpResponseRedirect(reverse(homescreen))
