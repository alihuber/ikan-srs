import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@apollo/react-hooks';
import { Button, Modal, Responsive, Divider, Segment } from 'semantic-ui-react';
import sift from 'sift';
import debounce from 'lodash/debounce';
import LoadingIndicator from '../LoadingIndicator';
import AddUserModal from './AddUserModal';
import UserTable from './UserTable';
import UserFilter from './UserFilter';
import { DELETE_USER_MUTATION, USERS_QUERY } from '../../../../api/users/constants';
import DeleteUserModal from './DeleteUserModal';

const UsersTable = () => {
  const [pageNum, setPageNum] = useState(0);
  const { data, loading, refetch, fetchMore } = useQuery(USERS_QUERY, {
    notifyOnNetworkStatusChange: true,
  });
  const [sort, setSort] = useState('createdAt');
  const [order, setOrder] = useState(null);
  const [limit, setLimit] = useState(10);
  const [q, setQ] = useState('');
  const [usersList, setUsersList] = useState(data?.users?.usersList || []);

  const [deleteUser, _] = useMutation(DELETE_USER_MUTATION);
  const [showDelete, setShowDelete] = useState(false);
  const [userToDelete, setUserToDelete] = useState(false);

  useEffect(() => {
    if (data && data.users && data.users.usersList) {
      if (q.length !== 0) {
        const filtered = data.users.usersList.filter(sift({ username: { $regex: q } }));
        setUsersList(filtered);
      } else {
        setUsersList(data.users.usersList);
      }
    }
  }, [JSON.stringify(data?.users?.usersList)]);

  const directionConverter = (ord) => {
    if (ord === 'asc') {
      return 'ascending';
    } else if (ord === 'desc') {
      return 'descending';
    } else {
      return null;
    }
  };

  const handleSort = (clickedColumn) => {
    let newOrder = order === 'asc' ? 'desc' : 'asc';
    if (sort !== clickedColumn) {
      newOrder = 'asc';
    }
    fetchMore({
      variables: {
        perPage: limit,
        q,
        order: newOrder,
        sort: clickedColumn,
      },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult) return prev;
        return fetchMoreResult;
      },
    });
    setOrder(newOrder);
    setSort(clickedColumn);
  };

  const submitFilter = (filter) => {
    if (filter !== q) {
      fetchMore({
        variables: {
          perPage: limit,
          q: filter,
          order,
          sort,
        },
        updateQuery: (prev, { fetchMoreResult }) => {
          if (!fetchMoreResult) return prev;
          return fetchMoreResult;
        },
      });
    }
    setQ(filter);
  };
  const onSubmitFilter = debounce(submitFilter, 500);

  const onChangeLimit = (event, dt) => {
    if (parseInt(dt.value, 10) !== limit) {
      fetchMore({
        variables: {
          perPage: parseInt(dt.value, 10),
          q,
          order,
          sort,
          pageNum,
        },
        updateQuery: (prev, { fetchMoreResult }) => {
          if (!fetchMoreResult) return prev;
          return fetchMoreResult;
        },
      });
      setLimit(dt.value);
    }
  };

  const handleDelete = (userId) => {
    setUserToDelete(userId);
    setShowDelete(true);
  };

  const cancelDelete = () => {
    setShowDelete(false);
    setUserToDelete(null);
  };

  const handleChangePage = (event, dt) => {
    fetchMore({
      variables: {
        perPage: limit,
        q: q || '',
        order,
        sort,
        pageNum: dt.activePage,
      },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult) return prev;
        return fetchMoreResult;
      },
    });
    setPageNum(dt.activePage);
  };

  if (data) {
    const usersCount = data.users.usersCount;
    return (
      <>
        <Modal
          trigger={(
            <Button name="addUserButton" size="small" primary>
              Add User
            </Button>
          )}
        >
          <AddUserModal refetch={refetch} setPageNum={setPageNum} />
        </Modal>
        <Divider />
        <Responsive minWidth={768}>
          <Segment>
            <UserFilter
              filter={q}
              totalCount={usersList.length}
              onSubmitFilter={onSubmitFilter}
              loading={loading}
            />
            <Divider />
            {!loading ? (
              <UserTable
                handleDelete={handleDelete}
                refetch={refetch}
                setPageNum={setPageNum}
                usersList={usersList}
                totalCount={usersCount}
                totalPages={Math.ceil(usersCount / limit)}
                currentPage={pageNum}
                onChangePage={handleChangePage}
                column={sort}
                direction={directionConverter(order)}
                handleSort={handleSort}
                onChangeLimit={onChangeLimit}
                limit={limit.toString()}
              />
            ) : <LoadingIndicator />}
          </Segment>
        </Responsive>
        <Responsive maxWidth={768}>
          <Segment>
            <UserFilter
              filter={q}
              totalCount={usersCount}
              onSubmitFilter={onSubmitFilter}
              loading={loading}
            />
            <Divider />
            {!loading ? (
              <UserTable
                handleDelete={handleDelete}
                refetch={refetch}
                setPageNum={setPageNum}
                usersList={usersList}
                totalCount={usersCount}
                totalPages={Math.ceil(usersCount / limit)}
                currentPage={pageNum}
                onChangePage={handleChangePage}
                column={sort}
                direction={directionConverter(order)}
                handleSort={handleSort}
                onChangeLimit={onChangeLimit}
                limit={limit.toString()}
              />
            ) : <LoadingIndicator />}
          </Segment>
        </Responsive>
        <DeleteUserModal
          setPageNum={setPageNum}
          refetch={refetch}
          deleteUserFunc={deleteUser}
          open={showDelete}
          onClose={cancelDelete}
          userToDelete={userToDelete}
        />
      </>
    );
  } else {
    return <LoadingIndicator />;
  }
};

export default UsersTable;
