from django.db import models
from django.contrib.auth.models import User

from django.contrib.auth.models import User
from django.db.models.signals import post_save

class HomeTown(models.Model):
    name = models.CharField(null=True, blank=True, max_length=255)

class News(models.Model):
    created_date = models.DateTimeField(auto_now_add=True)
    text = models.TextField()
    home_town = models.ForeignKey(HomeTown)
    author = models.ForeignKey(User)

class UserProfile(models.Model):
    user = models.OneToOneField(User)
    home_town = models.CharField(null=True, blank=True, max_length=255)
    country_of_birth = models.PositiveSmallIntegerField(null=True, blank=True)
    guid = models.CharField(null=True, blank=False, max_length=100)
    mobile_number = models.CharField(null=True, blank=False, max_length=20)

def create_user_profile(sender, instance, created, **kwargs):
    if created:
        UserProfile.objects.create(user=instance)
post_save.connect(create_user_profile, sender=User)

