from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),

    # API Routes
    # https://docs.djangoproject.com/en/5.0/topics/http/urls/#naming-url-patterns
    # https://stackoverflow.com/questions/51922641/what-is-the-function-of-the-name-parameter-in-django-urls-path
    # Send email requires a POST request to emails. The form action url in inbox.html is the path name 'compose'. 
    path("emails", views.compose, name="compose"),
    path("emails/<int:email_id>", views.email, name="email"),
    path("emails/<str:mailbox>", views.mailbox, name="mailbox"),
]
