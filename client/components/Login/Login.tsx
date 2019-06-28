import * as React from "react";
import { Formik } from "formik";
import { LoginPage as TablerLoginPage } from "tabler-react";
import { ILoginValues, ILoginError } from "../../types/login.types";
import "tabler-react/dist/Tabler.css";
import { accountsPassword } from '../../utils/account';
import Router from 'next/router';

export class LoginComponent extends React.Component {
    render() {
        return (
            <>
                <Formik
                    initialValues={{
                        email: "",
                        password: "",
                    }}
                    validate={(values: ILoginValues) => {
                        // same as above, but feel free to move this into a class method now.
                        let errors: ILoginError = {};
                        if (!values.email) {
                            errors.email = "Required";
                        } else if (
                            !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(values.email)
                        ) {
                            errors.email = "Invalid email address";
                        }
                        return errors;
                    }}
                    onSubmit={async (
                        values,
                        { setSubmitting, setErrors /* setValues and other goodies */ }
                    ) => {
                        setSubmitting(true);
                        try {
                            await accountsPassword.login({
                                password: values.password,
                                user: {
                                    email: values.email,
                                },
                            });
                            Router.replace('/timer');
                        } catch (err) {
                            setErrors({email : err.message || err});
                        }
                        setSubmitting(false);
                    }}
                    render={({
                        values,
                        errors,
                        touched,
                        handleChange,
                        handleBlur,
                        handleSubmit,
                        isSubmitting,
                    }) => (
                        <TablerLoginPage
                        onSubmit={handleSubmit}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        values={values}
                        errors={errors}
                        touched={touched}
                        isSubmitting={isSubmitting}
                        />
                    )}
                />
            </>
        );
    }
}

export default LoginComponent;