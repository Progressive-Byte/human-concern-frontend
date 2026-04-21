import Cookies from 'js-cookie';

export const home = 'http://localhost:3000';

// export const home = 'https://app.humanconcern.com';
export const siteUrl = 'https://donation.api.sagsio.com';

// export const subscriptionPage = `${home}/settings/subscription`;
// export const plansPage = `${home}/settings/subscription/plans`;
export const apiBase = `${siteUrl}/api/v1/`;
export const userEmail = Cookies.get('humanconcern_user_email') || '';
export const userHash = Cookies.get('humanconcern_user_hash') || '';