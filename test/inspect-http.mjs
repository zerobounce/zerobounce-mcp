// Test preload: prints the limits set on the HTTP server once it listens.
import net from 'node:net';
const listen = net.Server.prototype.listen;
net.Server.prototype.listen = function (...args) {
  this.once('listening', () => {
    console.error(
      `HTTPCFG ${JSON.stringify({
        headersTimeout: this.headersTimeout,
        requestTimeout: this.requestTimeout,
        maxConnections: this.maxConnections,
      })}`
    );
  });
  return listen.apply(this, args);
};
