export const isCookieSet = (cookieName: string): boolean =>
  document.cookie.split(";").some((c) => c.includes(`${cookieName}=`));

export const setCookieWithExpiry = (
  cName: string,
  cValue: string,
  expiry: number
) => {
  const expires = new Date();
  expires.setTime(expires.getTime() + expiry);
  document.cookie =
    `${cName}=${cValue};expires=` + expires.toUTCString() + ";path=/";
};
