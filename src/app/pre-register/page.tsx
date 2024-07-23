"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { Input } from "@nextui-org/react";
import { Button } from "@nextui-org/react";
import { Select, SelectSection, SelectItem } from "@nextui-org/select";
import { Spacer } from "@nextui-org/spacer";
import {
    Table,
    TableHeader,
    TableBody,
    TableColumn,
    TableRow,
    TableCell
} from "@nextui-org/table";
import { useFormik } from "formik";
import { collection, getDocs, addDoc, doc, query, where, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

import * as Yup from "yup";
type Form = {
    name: string;
    email: string;
    position: string;
    league: string;
};
export default function Home() {

    const leaguesRef = query(collection(db, "leagues"), where("isOpenToRequest", "==", true));
    const requestsRef = collection(db, "playerRequestLeague");
    const [leagues, setLeagues] = useState<any[]>([]);
    const [responseMessage, setResponseMessage] = useState<any>({});
    const [requestList, setRequestList] = useState<any[]>([]);

    const formik = useFormik({
        initialValues: {
            name: "",
            email: "",
            phone:"",
            position: "",
            league: "",
        },
        validationSchema: Yup.object({
            name: Yup.string().required("Nombre completo es requerido"),
            email: Yup.string().email("Correo invalido").required("Debe ingresar un correo"),
            phone: Yup.string().required("Debe ingresar un número de teléfono"),
            position: Yup.string().required("Debe seleccionar una posición"),
            league: Yup.string().required("Debe seleccionar una liga")
        }),
        onSubmit: (values) => {
            console.log(values)
            handleAddRequest(values);
        }
    });
    const getLeagues = async () => {
        const leaguesSnapshot = await getDocs(leaguesRef);
        const leaguesList = leaguesSnapshot.docs.map((doc) => doc.data());
        setLeagues(leaguesList);
    };
    const getRequests = async () => {
        const requestsSnapshot = await getDocs(requestsRef);
        const requestsList = requestsSnapshot.docs.map((doc) => doc.data()) as any[];
        setRequestList(requestsList
            .reduce((acc, request) => {
                const league = acc.find((item: any) => item.league === request.league);
                if (league) {
                    league.requests.push(request);
                } else {
                    acc.push({ league: request.league, requests: [request] });
                }
                return acc;
            }, [])
        );
    }
    const handleAddRequest = async (values: Form) => {
        try {
            const emailLeagueCombo = `${values.email}_${values.league}`;
            await setDoc(doc(db, "playerRequestLeague", emailLeagueCombo), values);
            formik.resetForm();
                setResponseMessage({ value: "Registro exitoso", type: "sucess" });
                getRequests();
        } catch (error) {
            setResponseMessage({ value: "Error al registrar", type: "error" });
            console.error("Error adding document: ", error);
        }
    }

    useEffect(() => {
        getLeagues();
        getRequests();
    }, []);

    useEffect(() => {
        console.log(formik.values);
        console.log(formik.errors);
    }, [formik.values, formik.errors]);

    return (
        <main className="dark text-foreground bg-background container mx-auto py-4">
            <div className="flex flex-col items-center">
                <Image
                    src="/images/team-logo.png"
                    alt="Soccer Ball"
                    width={100}
                    height={100}
                />
            </div>
            <div className="flex flex-row mt-5 gap-5">
                <div className="basis-1/2">
                    <h2 className="text-2xl font-bold mb-5 text-center">Pre-registro</h2>
                    <p className="text-md text-gray-400 mb-4">
                        Se les notificará por correo si fueron aceptados en la liga y su posición de juego.
                        <br />
                        Es un unico pago antes de iniciar la liga, si no se realiza el pago no se garantiza su cupo en la liga.<br />
                    </p>
                    {responseMessage.value &&
                        <p
                            className={"text-center mb-3" + (responseMessage.type === "sucess" ? " text-green-500" : responseMessage.type = "error" ? " text-red-500" : "")}
                        >{responseMessage.value}</p>
                    }
                    <form onSubmit={formik.handleSubmit}>
                        <Input
                            type="text"
                            placeholder="Nombre completo"
                            name="name"
                            value={formik.values.name}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            className="w-full"
                        />
                        {formik.touched.name && formik.errors.name ? (
                            <span className="text-red-500 text-sm"> {formik.errors.name}</span>
                        ) : null}
                        <Spacer y={4} />
                        <Input
                            type="email"
                            name="email"
                            placeholder="Correo"
                            value={formik.values.email}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            className="w-full"
                        />
                        {formik.touched.email && formik.errors.email ? (
                            <span className="text-red-500 text-sm"> {formik.errors.email}</span>
                        ) : null}
                        <Spacer y={4} />
                        <Input
                            type="text"
                            name="phone"
                            placeholder="Teléfono"
                            value={formik.values.phone}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            className="w-full"
                        />
                        {formik.touched.phone && formik.errors.phone ? (
                            <span className="text-red-500 text-sm"> {formik.errors.phone}</span>
                        ) : null}
                        <Spacer y={4} />
                        <Select
                            placeholder="Posición"
                            name="position"
                            selectedKeys={[formik.values.position]}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            className="w-full dark text-foreground !bg-background"
                        >
                            <SelectSection title="Posiciones">
                                <SelectItem key="first_base">1st Base - Costo: 70$ (titular)</SelectItem>
                                <SelectItem key="second_base">2nd Base - Costo: 70$ (titular)</SelectItem>
                                <SelectItem key="third_base">3rd Base - Costo: 70$ (titular)</SelectItem>
                                <SelectItem key="catcher">Catcher - Costo: 70$ (titular)</SelectItem>
                                <SelectItem key="left_field">Left Field - Costo: 70$ (titular)</SelectItem>
                                <SelectItem key="center_field">Center Field - Costo: 70$ (titular)</SelectItem>
                                <SelectItem key="right_field">Right Field - Costo: 70$ (titular)</SelectItem>
                                <SelectItem key="short_fiel">Short Field - Costo: 70$ (titular)</SelectItem>
                                <SelectItem key="pitcher">Pitcher - Costo: 35$</SelectItem>
                                <SelectItem key="reserva">Reserva - Costo: 35$</SelectItem>
                            </SelectSection>
                        </Select>
                        {formik.touched.position && formik.errors.position ? (
                            <span className="text-red-500 text-sm">{formik.errors.position}</span>
                        ) : null}
                        <Spacer y={4} />
                        <Select
                            placeholder="Liga"
                            name="league"
                            selectedKeys={[formik.values.league]}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            className="w-full"
                        >
                            <SelectSection title="Ligas">
                                {leagues.map((league) => (
                                    <SelectItem key={league.name}>
                                        {league.name}
                                    </SelectItem>
                                ))}
                            </SelectSection>
                        </Select>
                        {formik.touched.league && formik.errors.league ? (
                            <span className="text-red-500 text-sm">{formik.errors.league}</span>
                        ) : null}
                        <Spacer y={5} />
                        <Button type="submit" className="w-full">Enviar</Button>
                    </form>
                </div>
                <div className="basis-1/2">
                    {requestList.map((item) => (
                        <div key={item.league} className="flex flex-col gap-2 mb-4">
                            <h4 className="text-md mb-1">Liga: {item.league}</h4>
                            <Table>
                                <TableHeader>
                                    <TableColumn>Nombre</TableColumn>
                                    <TableColumn>Posición</TableColumn>
                                </TableHeader>
                                <TableBody>
                                    {item.requests.map((request: any) => (
                                        <TableRow key={request.email}>
                                            <TableCell>{request.name}</TableCell>
                                            <TableCell>{request.position}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    ))}
                </div>
            </div>
        </main>
    );
}
