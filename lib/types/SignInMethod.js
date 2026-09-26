export var SignInMethods;
(function (SignInMethods) {
    SignInMethods[SignInMethods["QR"] = 0] = "QR";
    SignInMethods[SignInMethods["GOOGLE"] = 1] = "GOOGLE";
    SignInMethods[SignInMethods["PIN"] = 2] = "PIN";
    SignInMethods[SignInMethods["INPUT"] = 3] = "INPUT";
})(SignInMethods || (SignInMethods = {}));
export var KeyboardType;
(function (KeyboardType) {
    KeyboardType[KeyboardType["DEFAULT"] = 0] = "DEFAULT";
    KeyboardType[KeyboardType["EMAIL"] = 1] = "EMAIL";
    KeyboardType[KeyboardType["PHONE"] = 2] = "PHONE";
    KeyboardType[KeyboardType["NUMBER"] = 3] = "NUMBER";
})(KeyboardType || (KeyboardType = {}));
export var TextInputType;
(function (TextInputType) {
    TextInputType[TextInputType["PASSWORD"] = 0] = "PASSWORD";
    TextInputType[TextInputType["DEFAULT"] = 1] = "DEFAULT";
})(TextInputType || (TextInputType = {}));
