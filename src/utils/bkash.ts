import config from '../config';
import ApiError from '../errors/ApiError';

type IBkashResponse = Record<string, any>;

// bKash এর token ১ ঘণ্টা চলে, তাই প্রতিবার না এনে মেমোরিতে রেখে দেওয়া হয়
let cachedToken: { value: string; expiresAt: number } | null = null;

// bKash এ POST রিকোয়েস্ট পাঠানোর সাধারণ ফাংশন
const callBkash = async (
  path: string,
  body: object,
  headers: Record<string, string>,
): Promise<IBkashResponse> => {
  let data: IBkashResponse | null = null;

  try {
    const response = await fetch(`${config.bkash.base_url}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json', ...headers },
      body: JSON.stringify(body),
    });
    data = await response.json();
  } catch (error) {
    console.error('bKash request failed:', error);
    throw new ApiError(502, 'Could not reach bKash. Please try again later');
  }

  if (!data) {
    throw new ApiError(502, 'bKash returned an invalid response');
  }

  return data;
};

// ---------- ১. Token আনা ----------
const getToken = async (): Promise<string> => {
  if (cachedToken && cachedToken.expiresAt > Date.now()) {
    return cachedToken.value;
  }

  const data = await callBkash(
    '/token/grant',
    { app_key: config.bkash.app_key, app_secret: config.bkash.app_secret },
    {
      username: config.bkash.username as string,
      password: config.bkash.password as string,
    },
  );

  if (data.statusCode !== '0000' || !data.id_token) {
    console.error('bKash token error:', data);
    throw new ApiError(502, 'bKash authentication failed. Check your bKash credentials in .env');
  }

  // মেয়াদ শেষের ১ মিনিট আগেই নতুন token আনার ব্যবস্থা
  cachedToken = {
    value: data.id_token,
    expiresAt: Date.now() + (Number(data.expires_in) - 60) * 1000,
  };

  return cachedToken.value;
};

const authHeaders = async () => ({
  Authorization: await getToken(),
  'X-APP-Key': config.bkash.app_key as string,
});

// ---------- ২. পেমেন্ট তৈরি, ফেরত আসে paymentID আর bkashURL ----------
export const createBkashPayment = async (input: {
  amount: string;
  invoiceNumber: string;
  payerReference: string;
}): Promise<{ paymentID: string; bkashURL: string }> => {
  const data = await callBkash(
    '/create',
    {
      mode: '0011',
      payerReference: input.payerReference,
      callbackURL: config.bkash.callback_url,
      amount: input.amount,
      currency: 'BDT',
      intent: 'sale',
      merchantInvoiceNumber: input.invoiceNumber,
    },
    await authHeaders(),
  );

  if (data.statusCode !== '0000' || !data.paymentID || !data.bkashURL) {
    console.error('bKash create payment error:', data);
    throw new ApiError(502, `bKash could not start the payment: ${data.statusMessage || 'unknown error'}`);
  }

  return { paymentID: data.paymentID, bkashURL: data.bkashURL };
};

// ---------- ৩. পেমেন্ট execute (এখানেই টাকা আসলে কাটা হয় আর যাচাই হয়) ----------
export const executeBkashPayment = async (paymentID: string): Promise<IBkashResponse> => {
  return callBkash('/execute', { paymentID }, await authHeaders());
};

// ---------- ৪. পেমেন্টের বর্তমান অবস্থা জানা ----------
export const queryBkashPayment = async (paymentID: string): Promise<IBkashResponse> => {
  return callBkash('/payment/status', { paymentID }, await authHeaders());
};