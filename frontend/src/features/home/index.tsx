import { Container } from '@mantine/core'
import React, { useState, type JSX } from 'react'
import Select from "../../components/ui/Select";

const Home: React.FC = (): JSX.Element => {
    // 1. Set initial value - empty string
    const [selectedValue, setSelectedValue] = useState(""); 

    // 2. Define options 
    const options = [
        { value: "option1", label: "Option 1" },
        { value: "option2", label: "Option 2" },
        { value: "option3", label: "Option 3" },
    ];

    return (
        <section>
            <Container>
                Home Page
                <Select
                // 3. Customize Select component with values, and colors
                    options={options}
                    value={selectedValue}
                    onChange={setSelectedValue}
                    placeholder="Select an option"

                    // Custom color 
                    background="#68b0ab"
                    textColor="#faf3dd"
                    borderColor="#68b0ab"
                    accentColor="#8FC0A9"
                    hoverColor="#dce1de"
                />
            </Container>
        </section>
    )
}

export default Home