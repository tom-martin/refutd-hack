from django.conf.urls.defaults import patterns, include, url

# Uncomment the next two lines to enable the admin:
# from django.contrib import admin
# admin.autodiscover()

urlpatterns = patterns('youmayknow.views',
    (r'^$', 'index'),
    (r'^youmayknow$', 'youmayknow'),

    (r'^createuserform$', 'createuserform'),
    (r'^createuser$', 'createuser'),
    (r'^homescreen$', 'homescreen'),
    (r'^news$', 'news'),
    (r'^logout$', 'logout_view'),
    (r'^login$', 'homescreenlogin'),
    (r'^user/(?P<user>\w+)/$', 'user'),
                       (r'^add_news$', 'add_news'),

    # Uncomment the admin/doc line below to enable admin documentation:
    # url(r'^admin/doc/', include('django.contrib.admindocs.urls')),

    # Uncomment the next line to enable the admin:
    # url(r'^admin/', include(admin.site.urls)),
)
