class HippoWeb3 {
  requestId;

  constructor() {
    this.requestId = 1;
  }

  connect() {
    return this._message('connect', {});
  }

  disconnect() {
    return this._message('disconnect', {});
  }

  isConnected() {
    return this._message('is_connected', {});
  }

  account() {
    return this._message('getAccountAddress', {});
  }

  signAndSubmitTransaction(transaction) {
    return this._message('signAndSubmit', transaction);
  }

  signTransaction(transaction) {
    return this._message('signTransaction', transaction);
  }

  _message(method, data) {
    const id = this.requestId;
    return new Promise(function (resolve, reject) {
      const listener = (event) => {
        if (event.detail.responseMethod === method && event.detail.id === id) {
          const response = event.detail.response;
          window.removeEventListener('hippo_contentscript_message', listener);
          if (response.error) {
            reject(response.error ?? 'Error');
          } else {
            resolve(response);
          }
        }
      };
      window.addEventListener('hippo_contentscript_message', listener);

      window.dispatchEvent(
        new CustomEvent('hippo_injected_script_message', { detail: { method, data, id } })
      );
    });
  }
}

window.hippoWallet = new HippoWeb3();
