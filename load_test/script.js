import http from 'k6/http';
import { sleep, check } from 'k6';

/**
 * Options for the load test
 * @type {import("k6/options").Options}
 */
export let options = {
  vus: 3333,
  duration: '1m',
};

export default function () {
  const res = http.get('http://localhost:3000')
  check(res, { 'status was 200': (r) => r.status === 200 });
  sleep(1)
}