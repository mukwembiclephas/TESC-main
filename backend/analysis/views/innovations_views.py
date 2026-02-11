from rest_framework.views import APIView
from rest_framework.response import Response
from django.db.models import Sum, Count
from innovation.models import InnovationHub, Project, Partnership

class HubAnalysisView(APIView):
    def get(self, request):
        hubs = InnovationHub.objects.all()
        
        # Stats
        total_hubs = hubs.count()
        total_cap = hubs.aggregate(Sum('capacity'))['capacity__sum'] or 1
        total_occ = hubs.aggregate(Sum('occupied'))['occupied__sum'] or 0
        occupancy_rate = int((total_occ / total_cap) * 100)
        
        # List Data (with Institution Name)
        hub_data = []
        for h in hubs:
            hub_data.append({
                "name": h.name,
                "institution": h.institution.name,
                "capacity": h.capacity,
                "occupied": h.occupied,
                "status": h.status
            })

        return Response({
            "stats": {
                "totalHubs": total_hubs,
                "totalCapacity": total_cap,
                "occupancyRate": f"{occupancy_rate}%",
                "activePrograms": hubs.filter(status='High').count() # Proxy metric
            },
            "hub_data": hub_data
        })

class StartupAnalysisView(APIView):
    def get(self, request):
        # Filter for Startups only
        qs = Project.objects.filter(stage='scaling') 
        
        stats = {
            "activeStartups": qs.count(),
            "totalRevenue": qs.aggregate(Sum('revenue_generated'))['revenue_generated__sum'] or 0, # Note: field is revenue_generated
            "peopleEmployed": qs.aggregate(Sum('jobs_created'))['jobs_created__sum'] or 0, # Note: field is jobs_created
            "fundingAcquired": qs.aggregate(Sum('funding_acquired'))['funding_acquired__sum'] or 0, # Note: field is funding_acquired
        }
        
        list_data = []
        for p in qs:
            list_data.append({
                "name": p.name,
                "category": p.location_category, # Note: field is location_category
                "institution": p.institution.name,
                "revenue": p.revenue_generated,
                "employed": p.jobs_created,
                "status": p.get_stage_display()
            })
            
        return Response({"stats": stats, "list_data": list_data})

class IndustrialAnalysisView(APIView):
    def get(self, request):
        # Projects
        industrial_qs = Project.objects.filter(stage='industrial')
        startup_qs = Project.objects.filter(stage='scaling')
        
        # Partnerships
        partners = Partnership.objects.all()
        
        # Sector Chart Data
        sectors = Project.objects.values('sector').annotate(value=Count('id'))
        
        return Response({
            "stats": {
                "commercialized": industrial_qs.count(),
                "partnerships": partners.count(),
                "startups": startup_qs.count(),
                "revenue": Project.objects.aggregate(Sum('revenue_generated'))['revenue_generated__sum'] or 0
            },
            "sectors": [{"name": s['sector'], "value": s['value']} for s in sectors],
            "partnerships": partners.values('id', 'partner_name', 'focus_area', 'status')
        })
        

# analysis/views.py

class InnovationOverviewView(APIView):
    """
    Endpoint: /api/analysis/innovation-overview/
    """
    def get(self, request):
        # 1. Pipeline Stages Count
        # Group projects by stage (Ideation, Prototype, etc.)
        pipeline_stats = Project.objects.values('stage').annotate(count=Count('id'))
        
        # Map database stage codes to readable labels and colors
        stage_config = {
            'ideation': {'label': 'Ideation', 'color': 'hsl(var(--warning))'},
            'research': {'label': 'Research', 'color': 'hsl(var(--info))'}, # If you use this stage
            'prototype': {'label': 'Prototype', 'color': 'hsl(var(--accent))'},
            'incubation': {'label': 'Incubation', 'color': 'hsl(var(--accent))'},
            'scaling': {'label': 'Industrialization', 'color': 'hsl(var(--success))'},
            'industrial': {'label': 'Commercialized', 'color': 'hsl(var(--primary))'}
        }

        pipeline_data = []
        total_projects = 0

        for entry in pipeline_stats:
            code = entry['stage']
            config = stage_config.get(code, {'label': code, 'color': 'hsl(var(--muted))'})
            
            pipeline_data.append({
                "stage": config['label'],
                "count": entry['count'],
                "color": config['color']
            })
            total_projects += entry['count']

      
        
        # 2. Recent Projects List
        recent_projects = Project.objects.select_related('institution').order_by('-created_at')[:10]
        project_list = []
        for p in recent_projects:
            project_list.append({
                "id": p.id,
                "name": p.name,
                "institution": p.institution.name,
                "stage": p.get_stage_display(),
                "status": "Active" # Or add a status field to Project model if needed
            })

        # 3. KPI Metrics
        industrial_count = Project.objects.filter(stage='industrial').count()
        hub_count = InnovationHub.objects.count()
        
        # 4. Mock Patents Data (Unless you create a Patent model)
        # For now we'll keep the mock logic for patents or return 0
        patents_filed = 45 # Placeholder

        return Response({
            "stats": {
                "total_projects": total_projects,
                "patents_filed": patents_filed,
                "industrial_projects": industrial_count,
                "hubs": hub_count
            },
            "pipeline": pipeline_data,
            "projects": project_list,
            # Mock patent trend for chart
            "patent_trend": [
                { "year": "2019", "Patents": 5 },
                { "year": "2020", "Patents": 8 },
                { "year": "2021", "Patents": 14 },
                { "year": "2022", "Patents": 22 },
                { "year": "2023", "Patents": 35 },
                { "year": "2024", "Patents": 45 },
            ]
        })
