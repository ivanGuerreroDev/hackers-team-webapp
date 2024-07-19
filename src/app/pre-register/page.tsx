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
import { collection, getDocs, addDoc, doc, query, where } from "firebase/firestore";
import {db} from "@/lib/firebase";

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
            position: "",
            league: "",
        },
        validationSchema: Yup.object({
            name: Yup.string().required("Nombre completo es requerido"),
            email: Yup.string().email("Correo invalido").required("Debe ingresar un correo"),
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
            const response = await addDoc(collection(db, "playerRequestLeague"), values);
            console.log(response)
            if(response){
                formik.resetForm();
                setResponseMessage({ value: "Registro exitoso", type: "sucess" });
                getRequests();
            } else {
                setResponseMessage({ value: "Error al registrar", type: "error" });
            }
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
            <h1 className="text-4xl font-bold text-center">Hackers</h1>
            <div className="flex flex-col items-center">
                <Image
                    src="/images/team-logo.png"
                    alt="Soccer Ball"
                    width={100}
                    height={100}
                />
            </div>
            <p className="text-md text-gray-400 mb-4">
                Cantidad de jugadores por posición:
                <br/>
                Catcher: 1<br/>
                Infield: 4 + 2 reservas<br/>
                Outfield: 4 + 2 reservas<br/>
                Pitcher: 2<br/>
                <br/>
                Las reservas pagaran solo la mitad del costo de inscripción.<br/>
            </p>
            <p>
                Se les notificará por correo si fueron aceptados en la liga, costo de inscripción y su posición en el equipo.
            </p>
            <div className="flex flex-row mt-5 gap-5">
                <div className="basis-1/2">
                    <h2 className="text-2xl font-bold mb-5 text-center">Pre-registro</h2>
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
                        <Select
                            placeholder="Posición"
                            name="position"
                            selectedKeys={[formik.values.position]}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            className="w-full dark text-foreground !bg-background"
                        >
                            <SelectSection title="Posiciones">
                                <SelectItem key="infield">Infield</SelectItem>
                                <SelectItem key="outfield">Outfield</SelectItem>
                                <SelectItem key="catcher">Catcher</SelectItem>
                                <SelectItem key="pitcher">Pitcher</SelectItem>
                                <SelectItem key="reserva">Reserva</SelectItem>
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
                                    <TableColumn>Correo</TableColumn>
                                    <TableColumn>Posición</TableColumn>
                                </TableHeader>
                                <TableBody>
                                    {item.requests.map((request: any) => (
                                        <TableRow key={request.email}>
                                            <TableCell>{request.name}</TableCell>
                                            <TableCell>{request.email}</TableCell>
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
