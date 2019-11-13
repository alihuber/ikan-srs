import React, { useContext } from 'react';
import { useHistory } from 'react-router-dom';
import { Container, Divider, Grid, Header, List, Segment } from 'semantic-ui-react';
import CurrentUserContext from '../contexts/CurrentUserContext';
import AnimContext from '../contexts/AnimContext';

const HomePage = () => {
  const animClass = useContext(AnimContext);
  const currentUser = useContext(CurrentUserContext);
  const history = useHistory();

  if (currentUser && currentUser._id) {
    history.push('/decks');
    return null;
  } else {
    return (
      <div className={animClass}>
        <Container text style={{ paddingTop: '4em' }}>
          <Header size="huge">Hello World</Header>
          <p>This is a basic fixed menu template using fixed size containers.</p>
          <p>A text container is used for the main container, which is useful for single column layouts.</p>
          <div style={{ marginTop: '2em' }}>Lorem</div>
          <div style={{ marginTop: '2em' }}>Ipsum</div>
          <div style={{ marginTop: '2em' }}>Dolor</div>
          <div style={{ marginTop: '2em' }}>Sit</div>
          <div style={{ marginTop: '2em' }}>Amet</div>
          <div style={{ marginTop: '2em' }}>Consetur</div>
          <div style={{ marginTop: '2em' }}>Sadipscing</div>
        </Container>

        <Segment inverted vertical style={{ margin: '5em 0em 0em', padding: '5em 0em' }}>
          <Container textAlign="center">
            <Grid divided inverted stackable>
              <Grid.Column width={3}>
                <Header inverted as="h4" content="Group 1" />
                <List link inverted>
                  <List.Item as="a">Link One</List.Item>
                  <List.Item as="a">Link Two</List.Item>
                </List>
              </Grid.Column>
              <Grid.Column width={3}>
                <Header inverted as="h4" content="Group 2" />
                <List link inverted>
                  <List.Item as="a">Link One</List.Item>
                  <List.Item as="a">Link Two</List.Item>
                </List>
              </Grid.Column>
              <Grid.Column width={3}>
                <Header inverted as="h4" content="Group 3" />
                <List link inverted>
                  <List.Item as="a">Link One</List.Item>
                  <List.Item as="a">Link Two</List.Item>
                </List>
              </Grid.Column>
              <Grid.Column width={7}>
                <Header inverted as="h4" content="Footer Header" />
                <p>Extra space for a call to action inside the footer that could help re-engage users.</p>
              </Grid.Column>
            </Grid>

            <Divider inverted section />
            <List
              horizontal inverted divided link
              size="small"
            >
              <List.Item as="a" href="#">
                Site Map
              </List.Item>
              <List.Item as="a" href="#">
                Contact Us
              </List.Item>
              <List.Item as="a" href="#">
                Terms and Conditions
              </List.Item>
              <List.Item as="a" href="#">
                Privacy Policy
              </List.Item>
            </List>
          </Container>
        </Segment>
      </div>
    );
  }
};

export default HomePage;
