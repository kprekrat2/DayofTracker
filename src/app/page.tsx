
import { DayOffRequestList } from "@/components/day-off/DayOffRequestList";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function MyRequestsPage() {
  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">My Day-Off Requests</CardTitle>
          <CardDescription>
            View and manage your submitted day-off requests.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DayOffRequestList />
        </CardContent>
      </Card>
    </div>
  );
}
