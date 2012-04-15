from django.shortcuts import render_to_response
from django.template import Context, loader, RequestContext
from suds.client import Client

url = 'http://78.109.215.13:8080/RefugeesUnited-RefugeesUnitedBusiness/OpenAPIBean?wsdl'
client = Client(url)
apiKey = '27341080-b050-11df-94e2-0800200c9a66'

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
    if resultSetSize <= 10 and resultSetSize > 1:
      return client.service.AdvancedSearch(newSearch, "27341080-b050-11df-94e2-0800200c9a66"), fieldsSearchedOn

  return [], []

def index(request):
  return render_to_response('wap/index.html', {}, context_instance=RequestContext(request))

def createuser1(request):
  print request.REQUEST
  return render_to_response('wap/createuser1.html', {}, context_instance=RequestContext(request))

def createuser2(request):
  print request.REQUEST
  return render_to_response('wap/createuser2.html', {}, context_instance=RequestContext(request))

def createuser3(request):
  print request.REQUEST
  return render_to_response('wap/createuser3.html', {}, context_instance=RequestContext(request))

def createuser4(request):
  print request.REQUEST
  return render_to_response('wap/createuser4.html', {}, context_instance=RequestContext(request))

def accept(request):
  print request.REQUEST
  return render_to_response('wap/adddetails.html', {}, context_instance=RequestContext(request))

def homescreen(request):
  print request.REQUEST
  return render_to_response('wap/homescreen.html', {}, context_instance=RequestContext(request))


def youmayknow(request):
  guid = request.GET["guid"]

  profile = client.service.GetProfile(guid, apiKey)

  results, fields = findMatches(profile)
  for result in results:
    result['matchingFields'] = []
    for field in fields:
      if profile[field] == result[field]:
        result['matchingFields'].append(field)

  return render_to_response('youmayknow.html', {'results': results}, context_instance=RequestContext(request))
