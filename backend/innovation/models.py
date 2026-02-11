# innovation/models.py
from django.db import models
from academic.models import Institution

# --- CHOICES ---
SECTORS = [
    ('agritech', 'Agriculture / AgriTech'),
    ('edtech', 'Education / EdTech'),
    ('healthtech', 'Health / BioTech'),
    ('fintech', 'FinTech'),
    ('mining', 'Mining & Engineering'),
    ('energy', 'Green Energy'),
    ('manufacturing', 'Manufacturing'),
    ('other', 'Other'),
]

PROJECT_STAGES = [
    # Innovation Phase
    ('ideation', 'Ideation'),
    ('prototype', 'Prototyping'),
    ('incubation', 'Incubation'),
    # Commercialisation Phase
    ('market_ready', 'Market Ready'),
    ('scaling', 'Scaling / Startup'),
    ('industrial', 'Industrialised'),
]

class InnovationHub(models.Model):
    institution = models.ForeignKey(Institution, on_delete=models.CASCADE, related_name='hubs')
    name = models.CharField(max_length=255)
    capacity = models.IntegerField(default=0)
    occupied = models.IntegerField(default=0)
    # services = models.IntegerField(help_text="Number of services offered", default=0)
    status = models.CharField(
        max_length=50, 
        choices=[('High', 'High Activity'), ('Medium', 'Medium Activity'), ('Full', 'Full Capacity')],
        default='Medium'
    )
    
    def __str__(self):
        return f"{self.name} ({self.institution.name})"

class Project(models.Model):
    """
    The master model for all Innovations, Startups, and Industrial Projects.
    Tracks lifecycle from Idea -> Industry.
    """
    institution = models.ForeignKey(Institution, on_delete=models.CASCADE, related_name='projects')
    hub = models.ForeignKey(InnovationHub, on_delete=models.SET_NULL, null=True, blank=True, related_name='projects')
    
    # Core Info
    name = models.CharField(max_length=255)
    team_name = models.CharField(max_length=255, blank=True)
    sector = models.CharField(max_length=50, choices=SECTORS)
    
    # Classification
    location_category = models.CharField(max_length=10, choices=[('Urban', 'Urban'), ('Rural', 'Rural')], default='Urban')
    stage = models.CharField(max_length=50, choices=PROJECT_STAGES, default='ideation')
    
    # Descriptions (From your old Innovation model)
    problem_statement = models.TextField(blank=True)
    proposed_solution = models.TextField(blank=True)
    
    # Commercial Stats (For Startups/Industrial)
    revenue_generated = models.DecimalField(max_digits=14, decimal_places=2, default=0.00)
    funding_acquired = models.DecimalField(max_digits=14, decimal_places=2, default=0.00)
    jobs_created = models.IntegerField(default=0)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} ({self.get_stage_display()})"

class ResearchGrant(models.Model):
    """
    Tracks specific research grants (SRS Requirement 4).
    """
    institution = models.ForeignKey(Institution, on_delete=models.CASCADE, related_name='grants')
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='grants')
    donor = models.CharField(max_length=255)
    amount = models.DecimalField(max_digits=14, decimal_places=2)
    date_awarded = models.DateField()
    
    def __str__(self):
        return f"{self.amount} - {self.donor}"

class Partnership(models.Model):
    institution = models.ForeignKey(Institution, on_delete=models.CASCADE, related_name='partnerships')
    partner_name = models.CharField(max_length=255)
    focus_area = models.CharField(max_length=255)
    agreement_date = models.DateField(null=True, blank=True)
    status = models.CharField(max_length=50, default="Active")

    def __str__(self):
        return self.partner_name