import Header from "@/components/layout/header";
import BottomNav from "@/components/layout/bottom-nav";
import SellForm from "@/components/forms/sell-form";

export default function Sell() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="pt-16 pb-20 max-w-md mx-auto">
        <div className="px-4 py-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Sell Your Mobile</h2>
          <SellForm />
        </div>
      </main>

      <BottomNav currentPage="sell" />
    </div>
  );
}
