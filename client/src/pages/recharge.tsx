import Header from "@/components/layout/header";
import BottomNav from "@/components/layout/bottom-nav";
import RechargeForm from "@/components/forms/recharge-form";

export default function Recharge() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="pt-16 pb-20 max-w-md mx-auto">
        <div className="px-4 py-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Mobile Recharge</h2>
          <RechargeForm />
        </div>
      </main>

      <BottomNav currentPage="recharge" />
    </div>
  );
}
