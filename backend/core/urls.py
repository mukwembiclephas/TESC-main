from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path("admin/", admin.site.urls),
    path('api/users/', include('users.urls')), # Include our API URLs
    path('api/academic/', include('academic.urls')),
    path("api/instauth/", include("instauth.urls")),
    path("api/faculties/", include("faculties.urls")),
    path("api/staff/", include("staff.urls")),
    path("api/v1/reports/", include("reports.urls")),
    path("api/analysis/", include("analysis.urls")),
    path("api/innovation/", include("innovation.urls")),
    

]
