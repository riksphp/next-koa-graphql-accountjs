import * as React from "react";
import "tabler-react/dist/Tabler.css";
import { RegisterPage as TablerRegisterPage } from "tabler-react";
import { Formik } from "formik";
import Router from 'next/router';
import { accountsPassword } from '../utils/account';

export class RegisterComponent extends React.Component {
    render() {
        return (
            <>
                <Formik
                    initialValues={{
                        email: "",
                        password: "",
                        name: ""
                    }}
                    validate={(values) => {
                        // same as above, but feel free to move this into a class method now.
                        let errors: any = {};
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
                            await accountsPassword.createUser({
                                password: values.password,
                                email: values.email,
                                username: values.name,
                                profile: {
                                    firstName: values.name ? values.name.split(" ")[0] : values.name,
                                    lastName: "",
                                }
                            });
                            Router.replace('/login');
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
                        <TablerRegisterPage
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

export default RegisterComponent;