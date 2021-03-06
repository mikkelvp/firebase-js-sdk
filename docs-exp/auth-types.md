<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [@firebase/auth-types](./auth-types.md)

## auth-types package

## Classes

|  Class | Description |
|  --- | --- |
|  [ActionCodeURL](./auth-types.actioncodeurl.md) | A utility class to parse email action URLs such as password reset, email verification, email link sign in, etc. |
|  [AuthCredential](./auth-types.authcredential.md) | Interface that represents the credentials returned by an [AuthProvider](./auth-types.authprovider.md)<!-- -->. |
|  [EmailAuthProvider](./auth-types.emailauthprovider.md) | Provider for generating [EmailAuthCredential](./auth.emailauthcredential.md)<!-- -->. |
|  [MultiFactorResolver](./auth-types.multifactorresolver.md) | The class used to facilitate recovery from [MultiFactorError](./auth-types.multifactorerror.md) when a user needs to provide a second factor to sign in. |
|  [OAuthCredential](./auth-types.oauthcredential.md) | Interface that represents the OAuth credentials returned by an [OAuthProvider](./auth.oauthprovider.md)<!-- -->. |
|  [PhoneAuthCredential](./auth-types.phoneauthcredential.md) | Interface that represents the credentials returned by a [PhoneAuthProvider](./auth.phoneauthprovider.md)<!-- -->. |
|  [PhoneAuthProvider](./auth-types.phoneauthprovider.md) | Provider for generating an [PhoneAuthCredential](./auth.phoneauthcredential.md)<!-- -->. |
|  [PhoneMultiFactorGenerator](./auth-types.phonemultifactorgenerator.md) | Provider for generating a [PhoneMultiFactorAssertion](./auth-types.phonemultifactorassertion.md)<!-- -->. |
|  [RecaptchaVerifier](./auth-types.recaptchaverifier.md) | An [reCAPTCHA](https://www.google.com/recaptcha/)<!-- -->-based application verifier. |

## Enumerations

|  Enumeration | Description |
|  --- | --- |
|  [Operation](./auth-types.operation.md) | An enumeration of the possible email action types. |
|  [OperationType](./auth-types.operationtype.md) | Enumeration of supported operation types. |
|  [ProviderId](./auth-types.providerid.md) | Enumeration of supported providers. |
|  [SignInMethod](./auth-types.signinmethod.md) | Enumeration of supported sign-in methods. |

## Interfaces

|  Interface | Description |
|  --- | --- |
|  [ActionCodeInfo](./auth-types.actioncodeinfo.md) | A response from [checkActionCode()](./auth.checkactioncode.md)<!-- -->. |
|  [ActionCodeSettings](./auth-types.actioncodesettings.md) | An interface that defines the required continue/state URL with optional Android and iOS bundle identifiers. |
|  [AdditionalUserInfo](./auth-types.additionaluserinfo.md) | A structure containing additional user information from a federated identity provider. |
|  [ApplicationVerifier](./auth-types.applicationverifier.md) | A verifier for domain verification and abuse prevention. |
|  [Auth](./auth-types.auth.md) | Interface representing Firebase Auth service. |
|  [AuthError](./auth-types.autherror.md) | Interface for an Auth error. |
|  [AuthProvider](./auth-types.authprovider.md) | Interface that represents an auth provider, used to facilitate creating [AuthCredential](./auth-types.authcredential.md)<!-- -->. |
|  [AuthSettings](./auth-types.authsettings.md) | Interface representing an Auth instance's settings. |
|  [Config](./auth-types.config.md) | Interface representing the Auth config. |
|  [ConfirmationResult](./auth-types.confirmationresult.md) | A result from a phone number sign-in, link, or reauthenticate call. |
|  [IdTokenResult](./auth-types.idtokenresult.md) | Interface representing ID token result obtained from [User.getIdTokenResult()](./auth-types.user.getidtokenresult.md)<!-- -->. |
|  [MultiFactorAssertion](./auth-types.multifactorassertion.md) | The base class for asserting ownership of a second factor. |
|  [MultiFactorError](./auth-types.multifactorerror.md) | The error thrown when the user needs to provide a second factor to sign in successfully. |
|  [MultiFactorInfo](./auth-types.multifactorinfo.md) | A structure containing the information of a second factor entity. |
|  [MultiFactorSession](./auth-types.multifactorsession.md) | An interface defining the multi-factor session object used for enrolling a second factor on a user or helping sign in an enrolled user with a second factor. |
|  [MultiFactorUser](./auth-types.multifactoruser.md) | An interface that defines the multi-factor related properties and operations pertaining to a [User](./auth-types.user.md)<!-- -->. |
|  [ParsedToken](./auth-types.parsedtoken.md) | Interface representing a parsed ID token. |
|  [Persistence](./auth-types.persistence.md) | An interface covering the possible persistence mechanism types. |
|  [PhoneMultiFactorAssertion](./auth-types.phonemultifactorassertion.md) | The class for asserting ownership of a phone second factor. Provided by [PhoneMultiFactorGenerator.assertion()](./auth-types.phonemultifactorgenerator.assertion.md)<!-- -->. |
|  [PhoneMultiFactorEnrollInfoOptions](./auth-types.phonemultifactorenrollinfooptions.md) | Options used for enrolling a second factor. |
|  [PhoneMultiFactorSignInInfoOptions](./auth-types.phonemultifactorsignininfooptions.md) | Options used for signing-in with a second factor. |
|  [PhoneSingleFactorInfoOptions](./auth-types.phonesinglefactorinfooptions.md) | Options used for single-factor sign-in. |
|  [PopupRedirectResolver](./auth-types.popupredirectresolver.md) | A resolver used for handling DOM specific operations like [signInWithPopup()](./auth.signinwithpopup.md) or [signInWithRedirect()](./auth.signinwithredirect.md)<!-- -->. |
|  [ReactNativeAsyncStorage](./auth-types.reactnativeasyncstorage.md) | Interface for a supplied AsyncStorage. |
|  [User](./auth-types.user.md) | A user account. |
|  [UserCredential](./auth-types.usercredential.md) | A structure containing a [User](./auth-types.user.md)<!-- -->, an [AuthCredential](./auth-types.authcredential.md)<!-- -->, the [OperationType](./auth-types.operationtype.md)<!-- -->, and any additional user information that was returned from the identity provider. |
|  [UserInfo](./auth-types.userinfo.md) | User profile information, visible only to the Firebase project's apps. |
|  [UserMetadata](./auth-types.usermetadata.md) | Interface representing a user's metadata. |

## Type Aliases

|  Type Alias | Description |
|  --- | --- |
|  [NextOrObserver](./auth-types.nextorobserver.md) | Type definition for an event callback. |
|  [PhoneInfoOptions](./auth-types.phoneinfooptions.md) | The information required to verify the ownership of a phone number. |
|  [UserProfile](./auth-types.userprofile.md) | User profile used in [AdditionalUserInfo](./auth-types.additionaluserinfo.md)<!-- -->. |

