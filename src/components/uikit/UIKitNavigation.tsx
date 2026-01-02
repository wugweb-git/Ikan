import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { 
  Breadcrumb, 
  BreadcrumbItem, 
  BreadcrumbLink, 
  BreadcrumbList, 
  BreadcrumbPage, 
  BreadcrumbSeparator 
} from '../ui/breadcrumb';
import { 
  Pagination, 
  PaginationContent, 
  PaginationEllipsis, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from '../ui/pagination';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';

export function UIKitNavigation() {
  return (
    <div className="space-y-8">
      {/* Breadcrumbs */}
      <Card>
        <CardHeader>
          <CardTitle>Breadcrumbs</CardTitle>
          <CardDescription>
            Indicates the current page location within a hierarchy.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/">Home</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href="/components">Components</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Breadcrumb</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </CardContent>
      </Card>

      {/* Pagination */}
      <Card>
        <CardHeader>
          <CardTitle>Pagination</CardTitle>
          <CardDescription>
            Used for splitting long lists of content.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious href="#" />
              </PaginationItem>
              <PaginationItem>
                <PaginationLink href="#">1</PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationLink href="#" isActive>
                  2
                </PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationLink href="#">3</PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationEllipsis />
              </PaginationItem>
              <PaginationItem>
                <PaginationNext href="#" />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Card>
        <CardHeader>
          <CardTitle>Tabs</CardTitle>
          <CardDescription>
            Switch between different views or contexts.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="account" className="w-[400px]">
            <TabsList>
              <TabsTrigger value="account">Account</TabsTrigger>
              <TabsTrigger value="password">Password</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>
            <TabsContent value="account">
              <div className="p-4 border rounded-md mt-2 bg-muted/20">
                Make changes to your account here.
              </div>
            </TabsContent>
            <TabsContent value="password">
              <div className="p-4 border rounded-md mt-2 bg-muted/20">
                Change your password here.
              </div>
            </TabsContent>
            <TabsContent value="settings">
              <div className="p-4 border rounded-md mt-2 bg-muted/20">
                Manage your settings here.
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
