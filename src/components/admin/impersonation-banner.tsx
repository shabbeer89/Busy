"use client";

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, X, User } from 'lucide-react';

interface ImpersonationBannerProps {
  impersonatedUser: {
    id: string;
    name: string;
    email: string;
    tenantName?: string;
  };
  onStopImpersonation: () => void;
}

export function ImpersonationBanner({ impersonatedUser, onStopImpersonation }: ImpersonationBannerProps) {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <Card className="border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-900/20 mb-4">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
              <span className="font-medium text-orange-800 dark:text-orange-200">
                Impersonation Mode
              </span>
            </div>

            <div className="flex items-center gap-2 text-sm text-orange-700 dark:text-orange-300">
              <User className="w-4 h-4" />
              <span>{impersonatedUser.name}</span>
              <span>({impersonatedUser.email})</span>
              {impersonatedUser.tenantName && (
                <>
                  <Badge variant="outline" className="text-xs">
                    {impersonatedUser.tenantName}
                  </Badge>
                </>
              )}
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setIsVisible(false);
              onStopImpersonation();
            }}
            className="text-orange-700 border-orange-300 hover:bg-orange-100 dark:text-orange-300 dark:border-orange-700 dark:hover:bg-orange-900/50"
          >
            <X className="w-4 h-4 mr-1" />
            Stop Impersonation
          </Button>
        </div>

        <div className="mt-2 text-sm text-orange-600 dark:text-orange-400">
          You are currently viewing the platform as this user. All actions will be performed on their behalf.
          Use the "Stop Impersonation" button to return to your admin account.
        </div>
      </CardContent>
    </Card>
  );
}