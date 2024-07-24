"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@nextui-org/react";
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

export default function Home() {
    const router = useRouter();
    const leaguesRef = query(collection(db, "leagues"), where("isOpenToRequest", "==", true));
    const [leagues, setLeagues] = useState<any[]>([]);
    const getLeagues = async () => {
        const leaguesSnapshot = await getDocs(leaguesRef);
        const leaguesList = leaguesSnapshot.docs.map((doc) => {
            return {
                id: doc.id,
                ...doc.data()
            }   
        });
        setLeagues(leaguesList);
    };

    useEffect(() => {
        getLeagues();
    }, []);

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
                <div className="basis-full">
                    <h2 className="text-2xl font-bold mb-5 text-center">Ligas disponibles</h2>
                    <Table>
                        <TableHeader>
                            <TableColumn>Liga</TableColumn>
                            <TableColumn>Fecha de inicio</TableColumn>
                            <TableColumn>Estado</TableColumn>
                            <TableColumn>Acciones</TableColumn>
                        </TableHeader>
                        <TableBody>
                            {leagues.map((league) => (
                                <TableRow key={league.id}>
                                    <TableCell>
                                        <div className="flex flex-row items-center">
                                            <img src={league.image} alt={league.name}  width="70"/>
                                            <p className="ml-3 font-bold text-lg">{league.name}</p>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {league.startDate.toDate().toLocaleDateString()}
                                    </TableCell>
                                    <TableCell>{league.status}</TableCell>
                                    <TableCell>
                                        <Button
                                            onClick={() => router.push(`/pre-register/${league.id}`)}
                                        >Registrarse</Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </main>
    );
}
