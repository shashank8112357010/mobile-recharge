import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/layout/header";
import PendingListings from "@/components/admin/pending-listings";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function Admin() {
  const { user } = useAuth();

  const { data: stats } = useQuery({
    queryKey: ['/api/admin/stats'],
  });

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6 text-center">
            <i className="fas fa-shield-alt text-red-500 text-4xl mb-4"></i>
            <h1 className="text-xl font-bold text-gray-900 mb-2">Access Denied</h1>
            <p className="text-gray-600 mb-4">You don't have permission to access this page.</p>
            <Link href="/">
              <Button>Go Back Home</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="pt-16 pb-8 max-w-md mx-auto">
        <div className="px-4 py-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Admin Dashboard</h2>
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          </div>
          
          {/* Stats Cards */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {stats?.usersCount || 0}
                </div>
                <div className="text-sm text-gray-600">Total Users</div>
                <div className="text-xs text-blue-600 mt-1">+234 today</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {stats?.pendingApprovalsCount || 0}
                </div>
                <div className="text-sm text-gray-600">Pending Approvals</div>
                <div className="text-xs text-orange-600 mt-1">Needs attention</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-gray-900">1,247</div>
                <div className="text-sm text-gray-600">Total Listings</div>
                <div className="text-xs text-green-600 mt-1">+12% this week</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-gray-900">
                  ₹{stats?.totalRevenue ? (stats.totalRevenue / 100000).toFixed(1) : '0'}L
                </div>
                <div className="text-sm text-gray-600">Revenue</div>
                <div className="text-xs text-green-600 mt-1">+8% this month</div>
              </CardContent>
            </Card>
          </div>

          {/* Pending Listings */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">Pending Listings</CardTitle>
            </CardHeader>
            <CardContent>
              <PendingListings />
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <div className="space-y-3">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <i className="fas fa-users text-blue-600"></i>
                    </div>
                    <span className="font-medium text-gray-900">Manage Users</span>
                  </div>
                  <i className="fas fa-chevron-right text-gray-400"></i>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <i className="fas fa-chart-bar text-green-600"></i>
                    </div>
                    <span className="font-medium text-gray-900">Reports & Analytics</span>
                  </div>
                  <i className="fas fa-chevron-right text-gray-400"></i>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                      <i className="fas fa-bullhorn text-purple-600"></i>
                    </div>
                    <span className="font-medium text-gray-900">Promotions</span>
                  </div>
                  <i className="fas fa-chevron-right text-gray-400"></i>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Back to App */}
          <div className="mt-8">
            <Link href="/">
              <Button variant="outline" className="w-full">
                <i className="fas fa-arrow-left mr-2"></i>
                Back to App
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
