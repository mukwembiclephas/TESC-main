import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { HelpCircle, BookOpen, Send } from "lucide-react";
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from "@/components/ui/accordion";
import { StatsCard } from "@/components/dashboard/StatsCard";

// --- COMPONENT ---
export default function Help() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <HelpCircle className="h-7 w-7" />
            Help & Support
          </h1>
          <p className="text-muted-foreground">
            Find answers, tutorials, and contact support
          </p>
        </div>

        {/* Stats */}
         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatsCard
                title="Knowledge Base"
                value="120 Articles"
                description="User guides and tutorials"
                icon={BookOpen}
                variant="info"
            />
            <StatsCard
                title="Open Tickets"
                value="3"
                description="Awaiting response"
                icon={HelpCircle}
                variant="warning"
            />
            <StatsCard
                title="Avg. Response Time"
                value="4 Hours"
                description="On business days"
                icon={Send}
            />
         </div>

        {/* FAQ and Support Form */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* FAQ Accordion */}
          <Card>
            <CardHeader>
              <CardTitle>Frequently Asked Questions (FAQ)</CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                  <AccordionTrigger>How do I add a new institution?</AccordionTrigger>
                  <AccordionContent>
                    Navigate to the 'Institutions' page and click the 'Register Institution' button. Fill out the required fields in the modal that appears.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-2">
                  <AccordionTrigger>How do I generate a report?</AccordionTrigger>
                  <AccordionContent>
                    Go to the 'Reports' page. Select the 'Report Type', desired 'Institution' filter, and the 'Date Range', then click 'Generate & Download'.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-3">
                  <AccordionTrigger>Can I export data to Excel?</AccordionTrigger>
                  <AccordionContent>
                    Yes. On pages like 'Students', you can use the 'Export' button. On the 'Reports' page, all generated reports are available as CSV or PDF downloads.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-4">
                  <AccordionTrigger>Who do I contact for a login issue?</AccordionTrigger>
                  <AccordionContent>
                    Please use the 'Contact Support' form on this page to submit a ticket, and an administrator will assist you with password resets or login problems.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>

          {/* Contact Support Form */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Support</CardTitle>
              <p className="text-sm text-muted-foreground">Submit a new support ticket</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input id="subject" placeholder="e.g., Unable to add student" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea 
                    id="message" 
                    placeholder="Please describe your issue in detail..." 
                    rows={8}
                />
              </div>
              <div className="flex justify-end">
                <Button>
                    <Send className="mr-2 h-4 w-4" />
                    Submit Ticket
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}