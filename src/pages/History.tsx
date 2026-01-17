import DashboardLayout from "@/components/DashboardLayout";

const History = () => {
  return (
    <DashboardLayout>
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">History</h1>
        <p className="text-muted-foreground">Your generated songs will appear here.</p>
      </div>
    </DashboardLayout>
  );
};

export default History;
