"use client";
import React, { useEffect, useState } from "react";
import { usePathname  } from 'next/navigation'
import Image from "next/image";
import { Input } from "@nextui-org/react";
import { Button } from "@nextui-org/react";
import { Progress } from "@nextui-org/react";
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
import { collection, getDocs, addDoc, doc, query, where, setDoc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import moment from "moment";
import "moment/locale/es";

import * as Yup from "yup";
type Form = {
    name: string;
    email: string;
    position: string;
    league: string;
};
export default function Home({params}: any) {
    const leagueId : string = params.slug as string;
    const requestsRef = collection(db, "playerRequestLeague");
    const [loading, setLoading] = useState<boolean>(false);
    const [league, setLeague] = useState<any>({});
    const [responseMessage, setResponseMessage] = useState<any>({});
    const [requestList, setRequestList] = useState<any[]>([]);

    const formik = useFormik({
        initialValues: {
            name: "",
            email: "",
            phone:"",
            position: "",
        },
        validationSchema: Yup.object({
            name: Yup.string().required("Nombre completo es requerido"),
            email: Yup.string().email("Correo invalido").required("Debe ingresar un correo"),
            phone: Yup.string().required("Debe ingresar un número de teléfono"),
            position: Yup.string().required("Debe seleccionar una posición")
        }),
        onSubmit: (values) => {
            handleAddRequest(values);
        }
    });
    const getLeague = async () => {
        setLoading(true);
        const leagueSnapshot = await getDoc( doc(db, "leagues", leagueId));
        const leagueData = leagueSnapshot.data();
        setLeague(leagueData);
        getRequests(leagueData?.name);
        setLoading(false);
    };
    const getRequests = async (leagueName: string) => {
        const requestsSnapshot = await getDocs( query(requestsRef, where("league", "==", leagueName)));
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
    const handleAddRequest = async (values: any) => {
        try {
            const emailLeagueCombo = `${values.email}_${values.league}`;
            values.league = league.name;
            setLoading(true);
            await setDoc(doc(db, "playerRequestLeague", emailLeagueCombo), values);
            setLoading(false);
            formik.resetForm();
                setResponseMessage({ value: "Registro exitoso", type: "sucess" });
                getRequests(league.name);
        } catch (error) {
            setResponseMessage({ value: "Error al registrar", type: "error" });
            console.error("Error adding document: ", error);
        }
    }

    useEffect(() => {
        getLeague();
    }, []);

    useEffect(() => {
        console.log(formik.values);
        console.log(formik.errors);
    }, [formik.values, formik.errors]);
    if(loading || !league?.name) return <Progress isIndeterminate value={50}  color="primary" />
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
            <div className="flex flex-row flex-wrap md:flex-nowrap mt-5 gap-5">
                <div className="basis-full md:basis-1/2">
                    <h2 className="text-2xl font-bold mb-5 text-center">Registro</h2>
                    <div className="flex flex-col items-center justify-center">
                        <img src={league.image} alt={league.name} width="100" />
                        <h3 className="text-lg font-bold mb-3 text-center">Liga: {league.name}</h3>
                    </div>
                    {league.description && <div dangerouslySetInnerHTML={{ __html: league.description }} />}
                    <p className="mb-4  text-gray-400">
                        Cierre de registro: <strong> {moment(league.registrationDeadline.toDate()).locale("es").format("LL")}</strong> <br />
                        Fecha de pago de inscripción: <strong> {moment(league.paymentDeadline.toDate()).locale("es").format("LL")}</strong> <br />
                        Fecha de inicio de la liga: <strong>{moment(league.startDate.toDate()).locale("es").format("LL")}</strong>
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
                                <SelectItem key="short_field">Short Field - Costo: 70$ (titular)</SelectItem>
                                <SelectItem key="pitcher">Pitcher - Costo: 35$</SelectItem>
                                <SelectItem key="reserva">Reserva - Costo: 35$</SelectItem>
                            </SelectSection>
                        </Select>
                        {formik.touched.position && formik.errors.position ? (
                            <span className="text-red-500 text-sm">{formik.errors.position}</span>
                        ) : null}
                        <Spacer y={4} />
                        <Button type="submit" className="w-full">Enviar</Button>
                    </form>
                </div>
                <div className="basis-full md:basis-1/2">
                    {requestList.map((item) => (
                        <div key={item.league} className="flex flex-col gap-2 mb-4">
                            <h4 className="text-md mb-1">Liga: {item.league}</h4>
                            <Table>
                                <TableHeader>
                                    <TableColumn>Nombre</TableColumn>
                                </TableHeader>
                                <TableBody>
                                    {item.requests.map((request: any) => (
                                        <TableRow key={request.email}>
                                            <TableCell>{request.name}</TableCell>
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
