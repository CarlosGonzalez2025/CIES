import type { Comision, PrimasComision } from "../types";

export const calculateComisionFromPrima = (prima: number, porcentajeImpuesto?: number): number => {
    return prima * (porcentajeImpuesto || 0);
};

// This function calculates the main commission values based on the monthly primas and percentages
export const calculateComisionTotals = (
    primas: Partial<PrimasComision>[], 
    comisionData: { 
        porcentaje_comision_arl?: number | null;
        porcentaje_comision_impuesto?: number | null;
        porcentaje_inversion?: number | null;
    }
) => {
    const valor_prima_emitida = primas.reduce((acc, p) => acc + (Number(p.prima) || 0), 0);
    
    const valor_comision_emitida = valor_prima_emitida * (comisionData.porcentaje_comision_arl || 0);
    
    const valor_comision_emitida_2024 = primas.reduce((acc, p) => acc + (Number(p.comision) || 0), 0);
    
    const valor_inversion = valor_comision_emitida_2024 * (comisionData.porcentaje_inversion || 0);

    return {
        valor_prima_emitida,
        valor_comision_emitida,
        valor_comision_emitida_2024,
        valor_inversion
    };
};
