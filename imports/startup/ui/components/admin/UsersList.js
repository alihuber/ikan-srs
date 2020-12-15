import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { Button, Divider, Segment } from 'semantic-ui-react';
import sift from 'sift';
import debounce from 'lodash/debounce';
import LoadingIndicator from '../LoadingIndicator';
import AddUserModal from './AddUserModal';
import UsersTable from './UsersTable';
import TableFilter from '../TableFilter';
import { DELETE_USER_MUTATION, USERS_QUERY } from '../../../../api/users/constants';
import DeleteUserModal from './DeleteUserModal';

const UsersList = () => {
  const [pageNum, setPageNum] = useState(1);
  const { data, loading, refetch, fetchMore } = useQuery(USERS_QUERY, {
    notifyOnNetworkStatusChange: true,
  });
  const [sort, setSort] = useState('createdAt');
  const [order, setOrder] = useState('asc');
  const [limit, setLimit] = useState(10);
  const [q, setQ] = useState('');
  const [usersList, setUsersList] = useState(data?.users?.usersList || []);

  // eslint-disable-next-line no-unused-vars
  const [deleteUser, _] = useMutation(DELETE_USER_MUTATION);
  const [showDelete, setShowDelete] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [userToDelete, setUserToDelete] = useState('');

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
        perPage: parseInt(limit, 10),
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
          perPage: parseInt(limit, 10),
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
      setLimit(parseInt(dt.value, 10));
    }
  };

  const cancelAdd = () => {
    setShowAdd(false);
    onChangeLimit(null, { value: 10 });
  };

  const handleDelete = (userId) => {
    setUserToDelete(userId);
    setShowDelete(true);
  };

  const cancelDelete = () => {
    setShowDelete(false);
    setUserToDelete('');
  };

  const handleChangePage = (event, dt) => {
    fetchMore({
      variables: {
        perPage: parseInt(limit, 10),
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
        <Button onClick={() => setShowAdd(true)} name="addUserButton" size="small" primary>
          Add User
        </Button>
        <Divider />
        <Segment>
          <TableFilter
            filter={q}
            totalCount={usersList.length}
            onSubmitFilter={onSubmitFilter}
            loading={loading}
          />
          <Divider />
          {!loading ? (
            <UsersTable
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
        <AddUserModal refetch={refetch} setPageNum={setPageNum} open={showAdd} onClose={cancelAdd} />
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

export default UsersList;
