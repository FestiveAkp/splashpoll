import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { useMutation } from 'react-query';
import { motion, useCycle } from 'framer-motion';
import { FaQuestionCircle } from 'react-icons/fa';
import {
    Box,
    Stack,
    Flex,
    Input,
    Checkbox,
    Button,
    Switch,
    Text,
    Tooltip
} from '@chakra-ui/react';
import { queryCache, createPoll } from '../api';

const HelpTooltip = () => (
    <Tooltip
        hasArrow
        bg="gray.300"
        color="black"
        placement="right"
        offset={[0,16]}
        label="This is some help text that might be kinda long but it's very informative and succinct"
    >
        <Box ml={2}><FaQuestionCircle /></Box>
    </Tooltip>
);

export default function PollCreate() {
    // Router state
    const history = useHistory();

    // Form fields
    const [question, setQuestion] = useState('');
    const [answers, setAnswers] = useState(['', '', '']);
    const [openEnded, setOpenEnded] = useState(false);
    const [multipleChoices, setMultipleChoices] = useState(false);
    const [mutate] = useMutation(createPoll);

    // Submit newly created poll to API
    const submit = async () => {
        const newPoll = {
            question,
            answers: !openEnded ? answers.filter(answer => answer !== '') : [],     // Filter out empty answers
            openEnded,
            multipleChoices
        };

        try {
            const data = await mutate(newPoll);
            queryCache.setQueryData(['poll', data.id], data);
            history.push('/' + data.id);
        } catch (e) {
            console.log(e);
        }
    }

    // Append a new answer field
    const addAnswerField = () => setAnswers(arr => [...arr, '']);

    // Modify an existing answer field
    const updateAnswerField = (i, newValue) => {
        const updatedAnswers = [...answers];
        updatedAnswers[i] = newValue;
        setAnswers(updatedAnswers);

        // Add new field if typing into the last one
        if (i === answers.length - 1) {
            addAnswerField();
        }
    }

    const [isOpen, toggleOpen] = useCycle(true, false);
    const [isOpen3, toggleOpen3] = useCycle(true, false);
    const toggleAnimations = () => {toggleOpen();toggleOpen3();}

    return (
        <Box className="poll-create">
                <Box as="header">
                    <Input
                        value={question}
                        onChange={e => setQuestion(e.target.value)}
                        variant="flushed"
                        placeholder="What's your question?"
                    />
                </Box>
                <Box as="section" mt={8}>
                    <Flex align="center" width="fit-content">
                        <Switch
                            id="open-ended"
                            isChecked={openEnded}
                            onChange={() => {setOpenEnded(b => !b); toggleAnimations()}}
                            mr={3}
                        />
                        <Text fontWeight="semibold" as="label" htmlFor="open-ended">Open response mode</Text>
                        <HelpTooltip />
                    </Flex>
                    <Flex align="center" mt={5}>
                        <Switch
                            id="multiple-choice"
                            isChecked={!openEnded}
                            onChange={() => {setOpenEnded(b => !b); toggleAnimations()}}
                            mr={3}
                        />
                        <Text fontWeight="semibold" as="label" htmlFor="multiple-choice">Fixed choice mode</Text>
                    </Flex>
                </Box>
            <motion.section
                animate={isOpen ? 'open' : 'closed'}
                initial="open"
                variants={{
                    open: { opacity: 1, y: "0%", height: 'auto', pointerEvents: 'auto' },
                    closed: { opacity: 0, y: "0%", height: 0, pointerEvents: 'none', transition: { type: 'tween' } }
                }}
                style={{marginTop:'2.5rem',marginBottom:'2.5rem'}}
            >
                {
                    <Stack as="section" spacing={3}>
                        {answers.map((answer, i) => (
                            <Input
                                key={i}
                                value={answer}
                                onChange={e => updateAnswerField(i, e.target.value)}
                                variant="flushed"
                                placeholder="Enter answer"
                            />
                        ))}
                    </Stack>
                }
            </motion.section>
            <motion.section
                animate={isOpen3 ? 'open' : 'closed'}
                variants={{
                    open: { y: 0 },
                    closed: { y: -40, transition: { type: 'spring', bounce: 0.35 } },
                }}
            >
                <Box as="section">
                    <Stack direction="column">
                        <Checkbox
                            value={multipleChoices}
                            onChange={() => setMultipleChoices(b => !b)}
                            size="sm"
                        >
                            Allow multiple poll answers
                        </Checkbox>
                    </Stack>
                </Box>
                <Box as="footer" mt={5}>
                    <Button onClick={submit} colorScheme="twitter">Create Poll</Button>
                </Box>
            </motion.section>
        </Box>
    );
}
