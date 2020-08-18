import React from 'react';
import PropTypes from 'prop-types';
import { Form, Popup } from 'semantic-ui-react';

const regex = new RegExp('^[a-zA-Z0-9 ]+$');

class TableFilter extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      filter: props.filter,
      filterValid: true,
    };
  }

  handleOnChange = (event, { name, value }) => {
    if (value !== '' && !regex.test(value)) {
      this.setState({ [name]: value, filterValid: false });
    } else {
      this.setState({ [name]: value, filterValid: true });
      const { onSubmitFilter } = this.props;
      onSubmitFilter(value);
    }
  };

  render() {
    const { filter, filterValid } = this.state;
    const { totalCount, loading } = this.props;
    let popupMessage = '';
    if (!filterValid) {
      popupMessage = 'Invalid character.';
    } else if (filter.length !== 0 && totalCount === 0) {
      popupMessage = 'No results found.';
    }

    return (
      <Form>
        <Form.Group>
          <Form.Field>
            <Popup
              trigger={(
                <Form.Input
                  placeholder="Enter the filter."
                  name="filter"
                  value={filter}
                  error={!filterValid}
                  label="Filter"
                  onChange={this.handleOnChange}
                  icon="search"
                  loading={loading}
                />
              )}
              content={popupMessage}
              on="click"
              open={filter.length !== 0 && (!filterValid || totalCount === 0)}
              position="right center"
            />
          </Form.Field>
        </Form.Group>
      </Form>
    );
  }
}

TableFilter.propTypes = {
  onSubmitFilter: PropTypes.func.isRequired,
  filter: PropTypes.string.isRequired,
  totalCount: PropTypes.number.isRequired,
  loading: PropTypes.bool.isRequired,
};

export default TableFilter;
