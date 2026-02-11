import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Building2,
  Bed,
  FlaskConical,
  Lightbulb,
  BookOpen,
  Dumbbell,
  Search,
  MapPin,
  Users,
  CheckCircle,
  AlertTriangle,
  Loader2
} from "lucide-react";
import { AddFacilityDialog } from "@/components/AddFacilityDialog";
import { getFacilities, Facility } from "@/services/facilities.services";
import { useAuth } from "@/context/AuthContext";

// Extended interface for UI display
interface UIFacility extends Facility {
  current: number; 
  icon: any;
}

const Facilities = () => {
  const [facilities, setFacilities] = useState<UIFacility[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [selectedFacility, setSelectedFacility] = useState<UIFacility | null>(null);
  
  const { user } = useAuth();
  
  const institutionId = user?.institution?.id || user?.institution_id;

  const getIconForType = (type: string) => {
    switch (type) {
      case 'Accommodation': return Bed;
      case 'Laboratory': return FlaskConical;
      case 'Library': return BookOpen;
      case 'Sports': return Dumbbell;
      case 'Innovation': return Lightbulb;
      default: return Building2;
    }
  };

  const fetchFacilities = async () => {
    // Don't fetch until we have an institution ID
    if (!institutionId) return;

    try {
      setLoading(true);
      // Filter by the logged-in user's institution ID
      const data = await getFacilities({ institution_id: institutionId });
      
      // Transform data for UI (Add icons and mock occupancy)
      const uiData = data.map(f => ({
        ...f,
        current: Math.floor(Math.random() * f.capacity), 
        icon: getIconForType(f.facility_type)
      }));
      
      setFacilities(uiData);
    } catch (error) {
      console.error("Failed to fetch facilities", error);
    } finally {
      setLoading(false);
    }
  };

  // Re-fetch when institutionId is available/changes
  useEffect(() => {
    fetchFacilities();
  }, [institutionId]);

  const filteredFacilities = facilities.filter(facility => {
    const matchesSearch = 
      facility.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      facility.facility_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (facility.building || "").toLowerCase().includes(searchQuery.toLowerCase());
      
    const matchesType = filterType === "all" || facility.facility_type === filterType;
    return matchesSearch && matchesType;
  });

  const facilityTypes = ["Accommodation", "Laboratory", "Library", "Sports", "Innovation", "Other"];
  const totalFacilities = facilities.length;
  const operationalFacilities = facilities.filter(f => f.status === "Active").length;
  const totalCapacity = facilities.reduce((sum, f) => sum + f.capacity, 0);
  const totalOccupancy = facilities.reduce((sum, f) => sum + f.current, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Facilities Management</h1>
        <p className="text-muted-foreground mt-1">Manage institutional facilities, infrastructure, and resources</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Facilities</CardDescription>
            <CardTitle className="text-3xl">{totalFacilities}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Across campus</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Operational</CardDescription>
            <CardTitle className="text-3xl text-green-600">{operationalFacilities}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Fully functional</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Capacity</CardDescription>
            <CardTitle className="text-3xl">{totalCapacity}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Available spaces</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Occupancy Rate</CardDescription>
            <CardTitle className="text-3xl text-primary">
              {totalCapacity > 0 ? Math.round((totalOccupancy / totalCapacity) * 100) : 0}%
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">{totalOccupancy} / {totalCapacity} utilized</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle>Facilities Directory</CardTitle>
              <CardDescription>View and manage all institutional facilities</CardDescription>
            </div>
            <AddFacilityDialog onFacilityAdded={fetchFacilities} />
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search facilities by name, type, or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button
                variant={filterType === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterType("all")}
              >
                All
              </Button>
              {facilityTypes.map((type) => (
                <Button
                  key={type}
                  variant={filterType === type ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterType(type)}
                >
                  {type}
                </Button>
              ))}
            </div>
          </div>

          {loading ? (
             <div className="flex justify-center items-center py-12 text-muted-foreground">
                 <Loader2 className="h-8 w-8 animate-spin mr-2" />
                 Loading Facilities...
             </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredFacilities.length === 0 ? (
                <div className="col-span-full text-center py-8 text-muted-foreground">
                  No facilities found
                </div>
              ) : (
                filteredFacilities.map((facility) => {
                  const Icon = facility.icon;
                  const utilizationRate = facility.capacity > 0 ? Math.round((facility.current / facility.capacity) * 100) : 0;
                  
                  return (
                    <Card key={facility.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setSelectedFacility(facility)}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-primary/10">
                              <Icon className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <CardTitle className="text-base">{facility.name}</CardTitle>
                              <CardDescription className="text-xs">{facility.facility_type}</CardDescription>
                            </div>
                          </div>
                          {facility.status === "Active" ? (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          ) : (
                            <AlertTriangle className="h-5 w-5 text-amber-500" />
                          )}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{facility.description}</p>
                        
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 text-sm">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            <span>{facility.building}</span>
                          </div>
                          
                          <div className="flex items-center gap-2 text-sm">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <span>
                              {facility.current} / {facility.capacity} 
                              <span className="text-muted-foreground ml-1">({utilizationRate}%)</span>
                            </span>
                          </div>

                          <div className="flex items-center justify-between pt-2">
                            <Badge 
                              variant={facility.status === "Active" ? "default" : "secondary"}
                              className={facility.status === "Active" ? "bg-green-600" : "bg-amber-600"}
                            >
                              {facility.status}
                            </Badge>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedFacility(facility);
                              }}
                            >
                              View Details
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Facility Detail Dialog */}
      <Dialog open={!!selectedFacility} onOpenChange={(open) => !open && setSelectedFacility(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{selectedFacility?.name}</DialogTitle>
            <DialogDescription>
              Detailed facility information and specifications
            </DialogDescription>
          </DialogHeader>
          {selectedFacility && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Facility Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Facility ID</p>
                      <p className="font-medium">{selectedFacility.id}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Name</p>
                      <p className="font-medium">{selectedFacility.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Type</p>
                      <p className="font-medium">{selectedFacility.facility_type}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Capacity</p>
                      <p className="font-medium">{selectedFacility.capacity}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Current Occupancy</p>
                      <p className="font-medium">{selectedFacility.current} / {selectedFacility.capacity}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Status</p>
                      <p className="font-medium capitalize">{selectedFacility.status}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Building</p>
                      <p className="font-medium">{selectedFacility.building}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Availability</p>
                      <p className="font-medium">
                        {selectedFacility.capacity > 0 ? Math.round(((selectedFacility.capacity - selectedFacility.current) / selectedFacility.capacity) * 100) : 0}% Available
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Equipment & Amenities</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                     <p className="text-sm">{selectedFacility.equipment || "No equipment listed."}</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Management & Contact</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Manager</p>
                      <p className="font-medium">{selectedFacility.manager}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Contact Number</p>
                      <p className="font-medium">{selectedFacility.contact_number}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Facilities;