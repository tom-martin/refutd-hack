from django.contrib import admin
from youmayknow.models import HomeTown, News


class HomeTownAdmin(admin.ModelAdmin):
    pass
admin.site.register(HomeTown, HomeTownAdmin)

class NewsAdmin(admin.ModelAdmin):
    pass
admin.site.register(News, NewsAdmin)

