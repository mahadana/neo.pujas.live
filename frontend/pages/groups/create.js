import Container from "@material-ui/core/Container";
import { useRouter } from "next/router";

import Banner from "@/components/Banner";
import GroupForm from "@/components/GroupForm";
import Loading from "@/components/Loading";
import NotLoggedIn from "@/components/NotLoggedIn";
import UserBar from "@/components/UserBar";
import { apolloClient, withApollo } from "@/lib/apollo";
import { CREATE_GROUP_MUTATION } from "@/lib/schema";
import { useSnackbar } from "@/lib/snackbar";
import { dayjs } from "@/lib/time";
import { useUser } from "@/lib/user";
import { translateStrapiError } from "@/lib/util";
import { groupSchema, groupCreateDbCast } from "@/lib/validation";

const GroupCreatePage = () => {
  const router = useRouter();
  const { snackError, snackSuccess } = useSnackbar();
  const { user, userLoading } = useUser();

  const onSubmit = async (values) => {
    const data = groupCreateDbCast.cast(values);
    data.confirmed = true;
    data.owner = user.id;
    const variables = { input: { data } };
    try {
      const result = await apolloClient.mutate({
        mutation: CREATE_GROUP_MUTATION,
        variables,
      });
      const newGroup = result.data.createGroup.group;
      snackSuccess("Successfully created group");
      router.push(`/groups/${newGroup.id}/edit`);
    } catch (error) {
      snackError(translateStrapiError(error));
      console.error(error);
    }
  };

  const newGroup = groupSchema.cast();
  newGroup.timezone = dayjs.tz.guess();

  return (
    <>
      <Banner />
      <UserBar />
      <Container maxWidth="sm">
        {userLoading ? (
          <Loading />
        ) : !user ? (
          <NotLoggedIn />
        ) : (
          <GroupForm group={newGroup} onSubmit={onSubmit} />
        )}
      </Container>
    </>
  );
};

export default withApollo()(GroupCreatePage);