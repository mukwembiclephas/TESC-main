from django.db import models



class InstitutionAdmin(models.Model):
    user = models.OneToOneField('users.CustomUser', on_delete=models.CASCADE, related_name="inst_admin")
    institution = models.OneToOneField("academic.Institution", on_delete=models.CASCADE, related_name="admin_account")

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} (Admin of {self.institution.name})"
