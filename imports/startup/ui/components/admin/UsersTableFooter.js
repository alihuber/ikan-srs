import React from 'react';
import PropTypes from 'prop-types';
import { Menu, Table } from 'semantic-ui-react';

const UsersTableFooter = ({ rowsPerPage, count, page, onChangePage }) => {
  const handleBackButtonClick = (event) => {
    onChangePage(event, page - 1);
  };

  const handleNextButtonClick = (event) => {
    onChangePage(event, page + 1);
  };

  const handleNumButtonClick = (event, num) => {
    onChangePage(event, num);
  };

  const numPages = Math.ceil(count / rowsPerPage);
  const isLastPage = page + 1 === numPages;

  return (
    <Table.Footer>
      <Table.Row>
        <Table.HeaderCell colSpan="4">
          <Menu floated="right" pagination>
            <Menu.Item disabled={page === 0} as="a" onClick={(evt) => handleBackButtonClick(evt)}>
              prev
            </Menu.Item>
            {[...Array(numPages).keys()].map((i) => (
              <Menu.Item key={i} as="a" disabled={page === i} onClick={(evt) => handleNumButtonClick(evt, i)}>
                {i + 1}
              </Menu.Item>
            ))}
            <Menu.Item as="a" disabled={isLastPage} onClick={(evt) => handleNextButtonClick(evt)}>
              next
            </Menu.Item>
          </Menu>
        </Table.HeaderCell>
      </Table.Row>
    </Table.Footer>
  );
};

UsersTableFooter.propTypes = {
  count: PropTypes.number.isRequired,
  onChangePage: PropTypes.func.isRequired,
  page: PropTypes.number.isRequired,
  rowsPerPage: PropTypes.number.isRequired,
};

export default UsersTableFooter;
