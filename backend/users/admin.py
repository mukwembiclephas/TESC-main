# # institutions/admin.py (or accounts/admin.py)
# from django.contrib import admin
# from academic.models import Institution

# @admin.register(Institution)
# class InstitutionAdmin(admin.ModelAdmin):
#     list_display = ('name', 'institution_type', 'city', 'province')
#     list_filter = ('institution_type', 'province')
#     search_fields = ('name', 'city')