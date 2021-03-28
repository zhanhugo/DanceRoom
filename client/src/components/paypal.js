import React from 'react';
import { PayPalButton } from "react-paypal-button-v2";
class PayPalBtn extends React.Component {
    render() {
      const { amount, onSuccess, currency } = this.props;
        return (
            <PayPalButton
              amount={amount}
              currency={currency}
              onSuccess={(details, data) => onSuccess(details, data)}
              options={{
                clientId: "sb"
              }}
          />
        );
    }
}
export default PayPalBtn;