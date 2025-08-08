// components/profile/SecurityRecommendations.jsx
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function SecurityRecommendations() {
  const tips = [
    {
      color: "bg-green-500",
      title: "Strong Password",
      desc: "Use 8+ characters with mix of letters, numbers",
    },
    {
      color: "bg-blue-500",
      title: "Regular Updates",
      desc: "Change password every 3-6 months",
    },
    {
      color: "bg-purple-500",
      title: "Unique Password",
      desc: "Don't reuse passwords from other sites",
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Security Recommendations</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-3">
          {tips.map((tip, idx) => (
            <div
              key={idx}
              className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg"
            >
              <div className={`w-2 h-2 ${tip.color} rounded-full`}></div>
              <div>
                <p className="font-medium text-sm">{tip.title}</p>
                <p className="text-xs text-muted-foreground">{tip.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
