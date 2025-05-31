import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      <div className="max-w-md mx-auto pt-16 px-4">
        {/* Logo and Header */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-6">
            <i className="fas fa-mobile-alt text-white text-2xl"></i>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-3">MobileHub</h1>
          <p className="text-gray-600 text-lg">Buy, Sell & Recharge</p>
          <p className="text-gray-500 mt-2">Your one-stop mobile marketplace</p>
        </div>

        {/* Features */}
        <div className="space-y-4 mb-12">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <i className="fas fa-shopping-bag text-primary"></i>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Buy & Sell Mobiles</h3>
                  <p className="text-gray-600 text-sm">Find the best deals on new and used phones</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <i className="fas fa-bolt text-secondary"></i>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Quick Recharge</h3>
                  <p className="text-gray-600 text-sm">Instant mobile and DTH recharges</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                  <i className="fas fa-shield-alt text-accent"></i>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Secure Platform</h3>
                  <p className="text-gray-600 text-sm">Safe and verified transactions</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Login Button */}
        <div className="text-center">
          <Button 
            onClick={() => window.location.href = '/api/login'}
            className="w-full py-6 text-lg font-semibold"
            size="lg"
          >
            Get Started
          </Button>
          <p className="text-gray-500 text-sm mt-4">
            Sign in to start buying, selling, and recharging
          </p>
        </div>

        {/* Footer */}
        <div className="text-center mt-16 pb-8">
          <p className="text-gray-400 text-sm">
            Trusted by thousands of users
          </p>
        </div>
      </div>
    </div>
  );
}
