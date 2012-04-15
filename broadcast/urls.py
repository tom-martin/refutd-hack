from django.conf.urls.defaults import patterns, include, url

# Uncomment the next two lines to enable the admin:
# from django.contrib import admin
# admin.autodiscover()

urlpatterns = patterns('broadcast.views',
    (r'^$', 'index'),
    (r'^createuser1$', 'createuser1'),
    (r'^createuser2$', 'createuser2'),
    (r'^createuser3$', 'createuser3'),
    (r'^createuser4$', 'createuser4'),
    (r'^accept$', 'accept'),
    (r'^homescreen$', 'homescreen'),

)
