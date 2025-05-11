
"use client";

import React, { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useData } from "@/hooks/useData";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { PlusCircle, Trash2, Edit3, Users, ShieldAlert, UserPlus, Search, KeyRound } from "lucide-react";
import type { User } from "@/types";

const addUserFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }).max(50, { message: "Name must not exceed 50 characters."}),
  email: z.string().email({ message: "Invalid email address." }),
  role: z.enum(["admin", "user"], { required_error: "Role is required." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
  confirmPassword: z.string().min(6, { message: "Please confirm password." }),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords do not match.",
  path: ["confirmPassword"],
});

type AddUserFormValues = z.infer<typeof addUserFormSchema>;

const editUserFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }).max(50, { message: "Name must not exceed 50 characters."}),
  email: z.string().email({ message: "Invalid email address." }),
  role: z.enum(["admin", "user"], { required_error: "Role is required." }),
  password: z.string().min(6, { message: "New password must be at least 6 characters." }).optional().or(z.literal('')), // Optional, can be empty string if not changing
  confirmPassword: z.string().optional().or(z.literal('')),
}).refine(data => {
  if (data.password && data.password.length > 0) { // If password is being changed
    return data.password === data.confirmPassword;
  }
  return true; // No password change, or passwords match
}, {
  message: "New passwords do not match.",
  path: ["confirmPassword"],
}).refine(data => { // If password is set, confirmPassword must also be set
  if (data.password && data.password.length > 0 && (!data.confirmPassword || data.confirmPassword.length === 0)) {
    return false;
  }
  return true;
}, {
  message: "Please confirm the new password.",
  path: ["confirmPassword"],
});

type EditUserFormValues = z.infer<typeof editUserFormSchema>;


export default function AdminUsersPage() {
  const { user: currentUser, isLoading: authLoading } = useAuth();
  const { users, addUser, updateUser, deleteUser, isLoading: dataLoading } = useData();
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [isAddUserDialogOpen, setIsAddUserDialogOpen] = useState(false);
  const [isEditUserDialogOpen, setIsEditUserDialogOpen] = useState(false);
  const [isDeleteUserDialogOpen, setIsDeleteUserDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const addUserForm = useForm<AddUserFormValues>({
    resolver: zodResolver(addUserFormSchema),
    defaultValues: { name: "", email: "", role: "user", password: "", confirmPassword: "" },
  });

  const editUserForm = useForm<EditUserFormValues>({
    resolver: zodResolver(editUserFormSchema),
  });

  useEffect(() => {
    if (!authLoading && (!currentUser || currentUser.role !== 'admin')) {
      router.push('/login'); // Redirect to login if not admin
    }
  }, [currentUser, authLoading, router]);

  useEffect(() => {
    if (selectedUser && isEditUserDialogOpen) {
      editUserForm.reset({
        name: selectedUser.name,
        email: selectedUser.email,
        role: selectedUser.role,
        password: "", // Don't prefill password
        confirmPassword: "",
      });
    }
  }, [selectedUser, isEditUserDialogOpen, editUserForm]);

  const handleAddUser = (data: AddUserFormValues) => {
    startTransition(() => {
      try {
        addUser({ name: data.name, email: data.email, role: data.role, password: data.password });
        toast({ title: "User Added", description: `${data.name} has been successfully added.` });
        setIsAddUserDialogOpen(false);
        addUserForm.reset();
      } catch (error) {
        toast({ title: "Failed to Add User", description: (error as Error).message || "Could not add user.", variant: "destructive" });
      }
    });
  };

  const handleEditUser = (data: EditUserFormValues) => {
    if (!selectedUser) return;
    startTransition(() => {
      try {
        const updatePayload: Partial<User & { password?: string }> = {
          name: data.name,
          email: data.email,
          role: data.role,
        };
        if (data.password && data.password.length > 0) {
          updatePayload.password = data.password;
        }
        updateUser(selectedUser.id, updatePayload);
        toast({ title: "User Updated", description: `${data.name}'s information has been updated.` });
        setIsEditUserDialogOpen(false);
        setSelectedUser(null);
        editUserForm.reset();
      } catch (error) {
        toast({ title: "Failed to Update User", description: (error as Error).message || "Could not update user.", variant: "destructive" });
      }
    });
  };

  const handleDeleteUser = () => {
    if (!selectedUser) return;
    if (selectedUser.id === currentUser?.id) {
      toast({ title: "Action Denied", description: "You cannot delete your own account.", variant: "destructive"});
      setIsDeleteUserDialogOpen(false);
      setSelectedUser(null);
      return;
    }
    startTransition(() => {
      try {
        deleteUser(selectedUser.id);
        toast({ title: "User Deleted", description: `${selectedUser.name} has been deleted.`, variant: "destructive" });
        setIsDeleteUserDialogOpen(false);
        setSelectedUser(null);
      } catch (error) {
        toast({ title: "Failed to Delete User", description: (error as Error).message || "Could not delete user.", variant: "destructive" });
      }
    });
  };

  const openEditDialog = (user: User) => {
    setSelectedUser(user);
    setIsEditUserDialogOpen(true);
  };

  const openDeleteDialog = (user: User) => {
    setSelectedUser(user);
    setIsDeleteUserDialogOpen(true);
  };

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );


  if (authLoading || dataLoading || !currentUser || currentUser.role !== 'admin') {
    return (
      <div className="space-y-8">
        <Card className="shadow-xl rounded-lg">
          <CardHeader>
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </CardHeader>
          <CardContent className="space-y-6">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-64 w-full rounded-lg" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <Card className="shadow-xl rounded-lg">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <Users className="h-7 w-7 text-primary" /> Manage Users
          </CardTitle>
          <CardDescription>
            Add, edit, or remove user accounts and manage their roles and credentials.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Dialog open={isAddUserDialogOpen} onOpenChange={setIsAddUserDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <UserPlus className="mr-2 h-4 w-4" /> Add New User
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Add New User</DialogTitle>
                  <DialogDescription>Fill in the details for the new user account.</DialogDescription>
                </DialogHeader>
                <Form {...addUserForm}>
                  <form onSubmit={addUserForm.handleSubmit(handleAddUser)} className="space-y-4 py-4">
                    <FormField control={addUserForm.control} name="name" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl><Input placeholder="John Doe" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={addUserForm.control} name="email" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address</FormLabel>
                        <FormControl><Input type="email" placeholder="user@example.com" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={addUserForm.control} name="password" render={({ field }) => (
                        <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl><Input type="password" placeholder="••••••••" {...field} /></FormControl>
                        <FormMessage />
                        </FormItem>
                    )} />
                    <FormField control={addUserForm.control} name="confirmPassword" render={({ field }) => (
                        <FormItem>
                        <FormLabel>Confirm Password</FormLabel>
                        <FormControl><Input type="password" placeholder="••••••••" {...field} /></FormControl>
                        <FormMessage />
                        </FormItem>
                    )} />
                    <FormField control={addUserForm.control} name="role" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Role</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl><SelectTrigger><SelectValue placeholder="Select a role" /></SelectTrigger></FormControl>
                          <SelectContent>
                            <SelectItem value="user">User</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <DialogFooter>
                      <DialogClose asChild><Button type="button" variant="outline">Cancel</Button></DialogClose>
                      <Button type="submit" disabled={isPending}>{isPending ? "Adding..." : "Add User"}</Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">
                      No users found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell className="capitalize">{user.role}</TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button variant="ghost" size="icon" onClick={() => openEditDialog(user)} disabled={isPending} aria-label={`Edit ${user.name}`}>
                          <Edit3 className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => openDeleteDialog(user)} disabled={isPending || user.id === currentUser.id} aria-label={`Delete ${user.name}`} className="text-destructive hover:text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Edit User Dialog */}
      <Dialog open={isEditUserDialogOpen} onOpenChange={setIsEditUserDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit User: {selectedUser?.name}</DialogTitle>
            <DialogDescription>Update the user's details, role, or password.</DialogDescription>
          </DialogHeader>
          <Form {...editUserForm}>
            <form onSubmit={editUserForm.handleSubmit(handleEditUser)} className="space-y-4 py-4">
              <FormField control={editUserForm.control} name="name" render={({ field }) => (
                <FormItem><FormLabel>Full Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={editUserForm.control} name="email" render={({ field }) => (
                <FormItem><FormLabel>Email Address</FormLabel><FormControl><Input type="email" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={editUserForm.control} name="role" render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value} disabled={selectedUser?.id === currentUser.id && selectedUser?.role === 'admin'}>
                    <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                    <SelectContent>
                      <SelectItem value="user">User</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                  {selectedUser?.id === currentUser.id && selectedUser?.role === 'admin' && (
                    <FormDescription className="text-xs text-destructive">Admins cannot demote themselves.</FormDescription>
                  )}
                  <FormMessage />
                </FormItem>
              )} />
              <div className="space-y-2 pt-2 border-t mt-4">
                 <Label className="text-sm font-medium flex items-center gap-1"><KeyRound size={14}/>Change Password (Optional)</Label>
                <FormField control={editUserForm.control} name="password" render={({ field }) => (
                    <FormItem>
                    <FormLabel className="text-xs">New Password</FormLabel>
                    <FormControl><Input type="password" placeholder="Leave blank to keep current" {...field} /></FormControl>
                    <FormMessage />
                    </FormItem>
                )} />
                <FormField control={editUserForm.control} name="confirmPassword" render={({ field }) => (
                    <FormItem>
                    <FormLabel className="text-xs">Confirm New Password</FormLabel>
                    <FormControl><Input type="password" placeholder="Confirm new password" {...field} /></FormControl>
                    <FormMessage />
                    </FormItem>
                )} />
              </div>
              <DialogFooter className="pt-4">
                <DialogClose asChild><Button type="button" variant="outline" onClick={() => setSelectedUser(null)}>Cancel</Button></DialogClose>
                <Button type="submit" disabled={isPending}>{isPending ? "Saving..." : "Save Changes"}</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete User Confirmation Dialog */}
      <Dialog open={isDeleteUserDialogOpen} onOpenChange={setIsDeleteUserDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><ShieldAlert className="h-6 w-6 text-destructive"/>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the user <strong>{selectedUser?.name}</strong> ({selectedUser?.email})? 
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-end gap-2">
            <DialogClose asChild><Button type="button" variant="outline" onClick={() => setSelectedUser(null)}>Cancel</Button></DialogClose>
            <Button type="button" variant="destructive" onClick={handleDeleteUser} disabled={isPending}>
              {isPending ? "Deleting..." : "Delete User"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
