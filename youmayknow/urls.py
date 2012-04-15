from django.conf.urls.defaults import patterns, include, url

# Uncomment the next two lines to enable the admin:
# from django.contrib import admin
# admin.autodiscover()

urlpatterns = patterns('youmayknow.views',
    (r'^$', 'index'),
    (r'^youmayknow$', 'youmayknow'),

    (r'^createuser1$', 'createuser1'),
    (r'^createuser2$', 'createuser2'),
    (r'^createuser3$', 'createuser3'),
    (r'^createuser4$', 'createuser4'),
    (r'^accept$', 'accept'),
    (r'^homescreen$', 'homescreen'),

    # Uncomment the admin/doc line below to enable admin documentation:
    # url(r'^admin/doc/', include('django.contrib.admindocs.urls')),

    # Uncomment the next line to enable the admin:
    # url(r'^admin/', include(admin.site.urls)),
)
