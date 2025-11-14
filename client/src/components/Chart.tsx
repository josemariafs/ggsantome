interface ChartProps {
  data: any[];
  title: string;
  type?: 'line' | 'bar' | 'pie';
}

const Chart = ({ data, title, type = 'line' }: ChartProps) => {
  return (
    <div className="stat-card">
      <h3 className="text-xl font-semibold mb-4">{title}</h3>
      <div className="text-gray-400 text-center py-8">
        <p>Gráfico de {type} - {data.length} puntos de datos</p>
      </div>
    </div>
  );
};

export default Chart;
