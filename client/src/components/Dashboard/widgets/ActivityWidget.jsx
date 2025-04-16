// client/src/components/Dashboard/widgets/ActivityWidget.jsx

import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { 
  Clock, 
  Home, 
  User, 
  DollarSign, 
  Mail, 
  Eye, 
  CheckCircle,
  AlertCircle,
  LogIn
} from "lucide-react";

export default function ActivityWidget({ isLoading }) {
  // Sample activity data
  const activities = [
    {
      id: "act-1",
      type: "offer",
      user: { name: "John Smith", initials: "JS" },
      description: "Made an offer on Mountain View Acreage",
      amount: "$275,000",
      time: new Date(Date.now() - 32 * 60 * 1000),
      icon: <DollarSign className="h-3 w-3" />
    },
    {
      id: "act-2",
      type: "property_view",
      user: { name: "Sarah Johnson", initials: "SJ" },
      description: "Viewed Lakefront Property details",
      time: new Date(Date.now() - 55 * 60 * 1000),
      icon: <Eye className="h-3 w-3" />
    },
    {
      id: "act-3",
      type: "user_signup",
      user: { name: "Michael Davis", initials: "MD" },
      description: "Created a new account",
      time: new Date(Date.now() - 2 * 60 * 60 * 1000),
      icon: <User className="h-3 w-3" />
    },
    {
      id: "act-4",
      type: "email_opened",
      user: { name: "Jessica Chen", initials: "JC" },
      description: "Opened 'New Properties Available' email",
      time: new Date(Date.now() - 3 * 60 * 60 * 1000),
      icon: <Mail className="h-3 w-3" />
    },
    {
      id: "act-5",
      type: "qualify",
      user: { name: "David Wilson", initials: "DW" },
      description: "Completed financing qualification form",
      time: new Date(Date.now() - 4 * 60 * 60 * 1000),
      icon: <CheckCircle className="h-3 w-3" />
    },
    {
      id: "act-6",
      type: "login",
      user: { name: "Emily Rodriguez", initials: "ER" },
      description: "Logged in to their account",
      time: new Date(Date.now() - 5 * 60 * 60 * 1000),
      icon: <LogIn className="h-3 w-3" />
    },
    {
      id: "act-7",
      type: "error",
      user: { name: "System", initials: "SY" },
      description: "Payment processing error occurred",
      time: new Date(Date.now() - 8 * 60 * 60 * 1000),
      icon: <AlertCircle className="h-3 w-3" />
    }
  ];

  const getActivityIcon = (type) => {
    const iconMap = {
      offer: <DollarSign className="h-4 w-4 text-green-500" />,
      property_view: <Eye className="h-4 w-4 text-blue-500" />,
      user_signup: <User className="h-4 w-4 text-purple-500" />,
      email_opened: <Mail className="h-4 w-4 text-yellow-500" />,
      qualify: <CheckCircle className="h-4 w-4 text-green-500" />,
      login: <LogIn className="h-4 w-4 text-blue-500" />,
      error: <AlertCircle className="h-4 w-4 text-red-500" />
    };
    return iconMap[type] || <Clock className="h-4 w-4 text-gray-500" />;
  };

  const getActivityBg = (type) => {
    const bgMap = {
      offer: "bg-green-100",
      property_view: "bg-blue-100",
      user_signup: "bg-purple-100",
      email_opened: "bg-yellow-100",
      qualify: "bg-green-100",
      login: "bg-blue-100",
      error: "bg-red-100"
    };
    return bgMap[type] || "bg-gray-100";
  };

  const formatTimeAgo = (date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return "Yesterday";
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    return format(date, "MMM d");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>
          Real-time activity from across the platform
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {Array(5).fill(0).map((_, idx) => (
              <div key={idx} className="flex gap-3">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-3 w-3/4" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <ScrollArea className="h-[350px] pr-4">
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-4 top-1 bottom-0 w-[1px] bg-gray-200"></div>
              
              {activities.map((activity, index) => (
                <div key={activity.id} className="mb-4 pl-10 relative">
                  {/* Timeline dot */}
                  <div className={`absolute left-[9px] -translate-x-1/2 w-8 h-8 rounded-full ${getActivityBg(activity.type)} flex items-center justify-center`}>
                    {getActivityIcon(activity.type)}
                  </div>
                  
                  <div className="bg-gray-50 p-3 rounded-lg shadow-sm">
                    <div className="flex items-center gap-2 mb-1">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="text-xs bg-[#324c48] text-white">
                          {activity.user.initials}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium text-sm">{activity.user.name}</span>
                      <span className="text-gray-400 text-xs">{formatTimeAgo(activity.time)}</span>
                    </div>
                    <p className="text-sm text-gray-600">
                      {activity.description}
                      {activity.amount && (
                        <Badge className="ml-2 bg-green-100 text-green-700 hover:bg-green-100">
                          {activity.amount}
                        </Badge>
                      )}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}