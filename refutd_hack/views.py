from django.shortcuts import render_to_response
from django.template import Context, loader, RequestContext
from suds.client import Client
import redis

r = redis.StrictRedis(host='localhost', port=6379, db=1)

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

  return []

def index(request):
  return render_to_response('index.html', {}, context_instance=RequestContext(request))

def youmayknow(request):
  guid = request.GET["guid"]

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
  

  return render_to_response('youmayknow.html', {'newCount': newCount, 'results': results}, context_instance=RequestContext(request))
  
