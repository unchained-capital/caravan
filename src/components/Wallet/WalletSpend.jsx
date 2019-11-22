import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

// Components
import NodeSet from "./NodeSet";
import {
    Box, Card, CardHeader,
    CardContent, Grid
  } from '@material-ui/core';

  import OutputsForm from '../Spend/OutputsForm';


class WalletSpend extends React.Component {

  static propTypes = {
    addNode: PropTypes.func.isRequired,
    updateNode: PropTypes.func.isRequired,
  };

  render() {
    const { addNode, updateNode, inputs } = this.props;
    return (
      <Box>
        <Grid container>
          <Grid item md={12}>
            <OutputsForm/>
          </Grid>
          <Grid item md={12}>
            <Card>
              <CardHeader title="Spend"/>
              <CardContent>
                <NodeSet addNode={addNode} updateNode={updateNode} />
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

      )
    }
}

function mapStateToProps(state) {
  return { ...state.spend.transaction};
}

const mapDispatchToProps = {

};

export default connect(mapStateToProps, mapDispatchToProps)(WalletSpend);
