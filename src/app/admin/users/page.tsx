import UserManagementClient from "@/app/admin/users/userManagementClient";
import {getUsers} from "@/lib/queries/users";
import {getRoles} from "@/lib/queries/roles";

export default async function UserManagementPage() {
    const users = await getUsers();
    const roles = await getRoles();

    return <UserManagementClient users={users} roles={roles}/>;
}
