import { currentUser } from "@/lib/auth";
import { UserInfo } from "@/components/user-info";

//Página com dados do usuário
const ServerPage = async () => {
  const user = await currentUser();

  return ( 
    <UserInfo
      label="💻 Server component"
      user={user}
    />
   );
}
 
export default ServerPage;